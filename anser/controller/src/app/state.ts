import {
	AnserDatabase,
	CanJobRunData,
	FunctionDescription,
	FunctionDescriptionMap,
	FunctionLoader,
	Heartbeat,
	HeartbeatResponse,
	JobRunConfig,
	JobStartRequestResponse,
	JobStatus,
	logger,
	strict,
	StrippedJobsDB,
	SystemInfoData,
	WorkerCommandCheckJobCanRun,
	WorkerCommandListFunctions,
	WorkerCommandsDB,
	WorkerCommandSendSystemInfo,
	WorkerCommandType,
	WorkerStatus
} from 'anser-types'
import { ObjectId } from 'mongodb'
import { Config } from '../config'
import { ANSER_VERSION } from './app'

const SYSTEM_INFO_REQUEST_PERIOD = 60 * 1000 // Every minute
const FUNCTION_LIST_REQUEST_PERIOD = 60 * 60 * 1000 // Every hour
const STATE_MANAGEMENT_INTERVAL = 1000 // Every second
const DISCONNECT_TIME = 5000 // Five seconds

/**
 * Stores the state of the controller.
 */
export class State {
	private _database: AnserDatabase
	private _functionLoader: FunctionLoader
	private _runManager: boolean = false
	private _managingState: boolean = false
	private _timeout?: NodeJS.Timeout

	constructor (config: Config, delayStart?: boolean) {
		// 'mongodb://localhost:59923'
		this._database = new AnserDatabase(config.dbUrl)
		this._functionLoader = new FunctionLoader(config.functionsDirectory, ANSER_VERSION, logger, delayStart)
		logger.info(`Functions: ${JSON.stringify(Array.from(this._functionLoader.GetFunctions().keys()))}`)
	}

	/**
	 * Init state.
	 */
	public async Initialize (): Promise<void> {
		return await this._database.Connect()
	}

	/**
	 * Destroy state.
	 */
	public async Destroy (): Promise<void> {
		return await this._database.Disconnect()
	}

	/**
	 * Starts managing the state.
	 */
	public StartManager (): void {
		this._runManager = true
		this.manageState()
	}

	/**
	 * Stops managing the state.
	 */
	public StopManager (): void {
		this._runManager = false
		if (this._timeout) clearTimeout(this._timeout)
	}

	/**
	 * Adds a heartbeat for a worker
	 * @param workerId ID of the worker to add a heartbeat to.
	 * @param heartbeat Heartbeat to add
	 */
	public async AddHeartbeat (workerId: string, heartbeat: Heartbeat): Promise<HeartbeatResponse> {
		const worker = await this._database.collections.WORKER.findOne({ workerId })
		let forceRequestAll = false
		if (!worker) {
			logger.info(`Worker ${workerId} connected`)
			this._database.collections.WORKER.insertOne(
				{ workerId, status: WorkerStatus.ONLINE }
			)
		} else {
			if (worker.status === WorkerStatus.OFFLINE) {
				logger.info(`Worker ${workerId} reconnected`)
				forceRequestAll = true
				this._database.collections.WORKER.updateOne(
					{ workerId }, { $set: { status: WorkerStatus.ONLINE } },
					{ upsert: true }
				)
			}
		}

		this._database.collections.WORKER_HEARTBEAT.insertOne(
			{ workerId, time: heartbeat.time, data: heartbeat.data }
		)
		heartbeat.data.forEach(async (command) => {
			await this._database.collections.COMMAND.deleteOne({ _id: new ObjectId(command.commandId) })
			switch(command.command) {
				case WorkerCommandType.SendSystemInfo:
					if (this.IsValidSystemInfoData(command.data)) {
						await this._database.collections.WORKER_SYSTEM_INFO.insertOne(
							{ workerId, data: command.data, lastReceived: Date.now() }
						)
					}
					break
				case WorkerCommandType.ListFunctions:
					if (this.IsValidListFunctionsData(command.data)) {
						await this._database.collections.WORKER_FUNCTION.updateOne(
							{ workerId },
							{ $set: { functions: command.data, lastRecieved: Date.now() } },
							{ upsert: true }
						)
					}
					break
				case WorkerCommandType.CheckJobCanRun:
					if (this.IsValidCanJobRunData(command.data)) {
						// no-op
					}
					break
			}
		})

		const reqSystemInfo = forceRequestAll || await this.requestSystemInfo(workerId)
		if (reqSystemInfo) {
			await this.requestSystemInfo(workerId)
		}

		const reqFunctionList = forceRequestAll || await this.requestFunctionList(workerId)
		if (reqFunctionList) {
			await this.requestFunctionList(workerId)
		}

		const commands: WorkerCommandsDB[] =
			(await this._database.collections.COMMAND.find({ workerId }).toArray())

		return { commands }
	}

	/**
	 * Gets the status of a worker. Returns NOT_REGISTERED if the worker does not exist.
	 * @param workerId Id of worker to find.
	 */
	public async GetWorkerStatus (workerId: string): Promise<WorkerStatus> {
		const worker = await this._database.collections.WORKER.findOne({ workerId })
		if (worker) return worker.status
		return WorkerStatus.NOT_REGISTERED
	}

	/**
	 * Gets all workers of a given status.
	 * @param status Status to find.
	 */
	public async GetWorkersOfStatus (status: WorkerStatus): Promise<string[]> {
		const workers = await this._database.collections.WORKER.find({ status }).toArray()
		return workers.map((worker) => worker.workerId)
	}

	/**
	 * Gets all heartbeats for a worker.
	 * @param workerId Id of worker to find.
	 */
	public async GetAllHearbeatsForWorker (workerId: string): Promise<Heartbeat[]> {
		return await this._database.collections.WORKER_HEARTBEAT.find(
			{ workerId }
		).toArray()
	}

	/**
	 * Gets all workers registered.
	 */
	public async GetAllWorkers (): Promise<string[]> {
		const workers = await this._database.collections.WORKER.find({ }).toArray()
		return workers.map((w) => w.workerId)
	}

	/**
	 * Returns the function descriptions compatible with this controller.
	 */
	public GetFunctionsKnownToAnser (): FunctionDescriptionMap {
		return this._functionLoader.GetFunctions()
	}

	/**
	 * Returns the function descriptions registered to a particular worker.
	 * @param workerId Id of worker to get functions for.
	 */
	public async GetFunctionsForWorker (workerId: string): Promise<FunctionDescriptionMap | undefined> {
		const functions = await this._database.collections.WORKER_FUNCTION.findOne(
			{ workerId }, { sort: { $natural: -1 } }
		)
		return functions?.functions
	}

	/**
	 * Returns true if data is a valid function description map.
	 * @param data Map to validate.
	 */
	public IsValidListFunctionsData (data: FunctionDescriptionMap): boolean {
		if (data === null || typeof data !== 'object') return false

		if (!data) return false

		const exampleFunction: FunctionDescription = {
			author: '',
			config: [],
			inputs: [],
			main: '',
			name: '',
			outputs: [],
			packageName: '',
			targetVersion: '',
			version: ''
		}

		for (const key of Object.keys(data)) {
			const funcs = data.get(key)

			if (!funcs) return false

			if (Object.keys(funcs).sort().toString() !== Object.keys(exampleFunction).sort().toString()) {
				return false
			}
		}

		return true
	}

	/**
	 * Returns true if data is valid system info data.
	 * @param data Data to validate.
	 */
	public IsValidSystemInfoData (data: SystemInfoData): boolean {
		const exampleCommand: SystemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30,
			ram_used: 25
		}

		return Object.keys(data).sort().toString() === Object.keys(exampleCommand).sort().toString()
	}

	/**
	 * Returns true if data is valid CanJobRun data.
	 * @param data Data to validate.
	 */
	public IsValidCanJobRunData (data: CanJobRunData): boolean {
		const keys = Object.keys(data)

		return keys.includes('canRun') && keys.includes('jobId')
	}

	/**
	 * Starts a job on a targeted worker. Does not check if the job already exists.
	 * @param workerId Worker to start job on.
	 * @param req Job to start.
	 */
	public async AddJobToWorker (workerId: string, req: JobRunConfig): Promise<JobStartRequestResponse> {
		const worker = await this._database.collections.WORKER.findOne({ workerId })

		if (!worker) return { status: JobStatus.FAILED_TO_START, details: `Worker ${workerId} does not exist` }

		const key = `functions.${req.functionId}`
		logger.info(key)
		const func = await this._database.collections.WORKER_FUNCTION.findOne(
			{ [key]: { $exists: true } }
		)

		if (!func) return { status: JobStatus.FAILED_TO_START, details: `Function ${req.functionId} does not exist` }

		const insertDoc: StrippedJobsDB = {
			status: JobStatus.STARTING,
			target: { workerId },
			runConfig: req
		}

		const id = await this._database.collections.JOB.insertOne(insertDoc)

		this._database.collections.COMMAND.insertOne({
			workerId,
			command: strict<WorkerCommandCheckJobCanRun>({
				type: WorkerCommandType.CheckJobCanRun,
				jobId: id.insertedId,
				job: req,
				startImmediate: true
			})
		})

		return { status: JobStatus.STARTING, jobId: id.insertedId, details: `Starting job ${id.insertedId}` }
	}

	private async requestSystemInfo (workerId: string): Promise<boolean> {
		const info = await this._database.collections.WORKER_SYSTEM_INFO.findOne(
			{ workerId }, { sort: { $natural: -1 } }
		)
		if(!info) {
			return true
		} else {
			const lastReceived = info.lastReceived
			const now = Date.now()

			if ((now - lastReceived) >= SYSTEM_INFO_REQUEST_PERIOD) {
				return true
			}
		}

		return false
	}

	private async requestFunctionList (workerId: string): Promise<boolean> {
		const functions = await this._database.collections.WORKER_FUNCTION.findOne(
			{ workerId }, { sort: { $natural: -1 } }
		)
		if(!functions) {
			return true
		} else {
			const lastReceived = functions.lastRecieved
			const now = Date.now()

			if ((now - lastReceived) >= FUNCTION_LIST_REQUEST_PERIOD) {
				return true
			}
		}

		return false
	}

	private async manageState (): Promise<void> {
		if (this._managingState) {
			return Promise.resolve()
		}
		this._managingState = true
		if (this._timeout) clearTimeout(this._timeout)

		if (!this._database.collections && this._runManager) {
			this._managingState = false
			this._timeout = setTimeout(() => this.manageState(), STATE_MANAGEMENT_INTERVAL)
			return
		}

		const workers = await this._database.collections.WORKER.find({ }).toArray()

		for (const worker of workers) {
			const lastHeartBeat = await this._database.collections.WORKER_HEARTBEAT.find(
				{ workerId: worker.workerId },
				{ sort: { $natural: -1 } }
			).next()

			if (!lastHeartBeat) continue

			if (Date.now() - lastHeartBeat.time >= DISCONNECT_TIME && worker.status === WorkerStatus.ONLINE) {
				this._database.collections.WORKER.updateOne({ _id: worker._id }, { $set: { status: WorkerStatus.OFFLINE } })
				logger.info(`Worker ${worker.workerId} disconnected. Last seen: ${new Date(lastHeartBeat.time)}`)
			}

			const reqSystemInfo = await this.requestSystemInfo(worker.workerId)
			if (reqSystemInfo) {
				await this.getSystemInfoFromWorker(worker.workerId)
			}

			const reqFunctionList = await this.requestFunctionList(worker.workerId)
			if (reqFunctionList) {
				await this.getFunctionsFromWorker(worker.workerId)
			}
		}

		this._managingState = false

		/* istanbul ignore next */
		if (this._runManager) {
			this._timeout = setTimeout(() => this.manageState(), STATE_MANAGEMENT_INTERVAL)
		}
	}

	private async getSystemInfoFromWorker (workerId: string): Promise<void> {
		const existing = await this._database.collections.COMMAND.findOne({
			workerId,
			'command.type': WorkerCommandType.SendSystemInfo
		})

		if (existing) return

		this._database.collections.COMMAND.insertOne({
			workerId,
			command: strict<WorkerCommandSendSystemInfo>({
				type: WorkerCommandType.SendSystemInfo
			})
		})
	}

	private async getFunctionsFromWorker (workerId: string): Promise<void> {
		const existing = await this._database.collections.COMMAND.findOne({
			workerId,
			'command.type': WorkerCommandType.ListFunctions
		})

		if (existing) return

		this._database.collections.COMMAND.insertOne({
			workerId,
			command: strict<WorkerCommandListFunctions>({
				type: WorkerCommandType.ListFunctions
			})
		})
	}
}
