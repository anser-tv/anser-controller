import {
	FunctionDescription,
	FunctionDescriptionMap,
	FunctionLoader,
	Heartbeat,
	HeartbeatCommand,
	HeartbeatCommandListFunctions,
	HeartbeatCommandSendSystemInfo,
	HeartbeatCommandType,
	HeartbeatResponse,
	JobStartRequest,
	JobStartRequestResponse,
	JobStatus,
	logger,
	strict,
	SystemInfoData
} from 'anser-types'
import { Config } from '../config'
import { ANSER_VERSION } from './app'

const SYSTEM_INFO_REQUEST_PERIOD = 60 * 1000 // Every minute
const FUNCTION_LIST_REQUEST_PERIOD = 60 * 60 * 1000 // Every hour
const STATE_MANAGEMENT_INTERVAL = 1000 // Every second
const DISCONNECT_TIME = 5000 // Five seconds

export enum WorkerStatus {
	NOT_REGISTERED = 'NOT_REGISTERED',
	ONLINE = 'ONLINE',
	OFFLINE = 'OFFLINE'
}

/**
 * Stores the state of the controller.
 */
export class State {
	private _workersRegistered: Map<string, WorkerStatus> = new Map<string, WorkerStatus>()
	private _heartBeats: { [workerId: string]: Heartbeat[] }
	private _lastHeartbeat: { [workerId: string]: Heartbeat }
	private _systemInfo: { [workerId: string]: { lastReceived: Date, data: SystemInfoData } }
	private _workerFunctionLists: { [workerId: string]: { lastRecieved: Date, functions: FunctionDescriptionMap } }
	private _functionLoader: FunctionLoader
	private _runManager: boolean = false
	private _timeout?: NodeJS.Timeout

	constructor (config: Config, delayStart?: boolean) {
		this._heartBeats = { }
		this._lastHeartbeat = { }
		this._systemInfo = { }
		this._workerFunctionLists = { }
		this._functionLoader = new FunctionLoader(config.functionsDirectory, ANSER_VERSION, logger, delayStart)
		logger.info(`Functions: ${JSON.stringify(this._functionLoader.GetFunctions())}`)
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
	public AddHeartbeat (workerId: string, heartbeat: Heartbeat): HeartbeatResponse {
		if (!this._workersRegistered.has(workerId)) {
			this._heartBeats[workerId] = []
			this._workersRegistered.set(workerId, WorkerStatus.ONLINE)
			logger.info(`Worker ${workerId} connected`)
		} else {
			if (this._workersRegistered.get(workerId) === WorkerStatus.OFFLINE) {
				this._workersRegistered.set(workerId, WorkerStatus.ONLINE)
				logger.info(`Worker ${workerId} reconnected`)
			}
		}
		this._heartBeats[workerId].push(heartbeat)
		this._lastHeartbeat[workerId] = heartbeat
		heartbeat.data.forEach((command) => {
			switch(command.command) {
				case HeartbeatCommandType.SendSystemInfo:
					if (this.IsValidSystemInfoData(command.data)) {
						this._systemInfo[workerId] = {
							data: command.data,
							lastReceived: new Date()
						}
					}
					break
				case HeartbeatCommandType.ListFunctions:
					if (this.IsValidListFunctionsData(command.data)) {
						this._workerFunctionLists[workerId] = {
							functions: command.data,
							lastRecieved: new Date()
						}
					}
			}
		})
		const commands: HeartbeatCommand[] = []
		if (this.requestSystemInfo(workerId)) {
			commands.push(
				strict<HeartbeatCommandSendSystemInfo>({
					type: HeartbeatCommandType.SendSystemInfo
				})
			)
		}

		if (this.requestFunctionList(workerId)) {
			commands.push(
				strict<HeartbeatCommandListFunctions>({
					type: HeartbeatCommandType.ListFunctions
				})
			)
		}

		return { commands }
	}

	/**
	 * Gets the status of a worker. Returns NOT_REGISTERED if the worker does not exist.
	 * @param workerId Id of worker to find.
	 */
	public GetWorkerStatus (workerId: string): WorkerStatus {
		if (this._workersRegistered.has(workerId)) return this._workersRegistered.get(workerId)!
		return WorkerStatus.NOT_REGISTERED
	}

	/**
	 * Gets all workers of a given status.
	 * @param status Status to find.
	 */
	public GetWorkersOfStatus (status: WorkerStatus): string[] {
		return [...this._workersRegistered]
			.filter(([_workerId, stat]) => stat === status)
			.map(([workerId, _stat]) => workerId)
	}

	/**
	 * Gets all heartbeats for a worker.
	 * @param workerId Id of worker to find.
	 */
	public GetAllHearbeatsForWorker (workerId: string): Heartbeat[] {
		if (this._heartBeats[workerId]) {
			return this._heartBeats[workerId]
		}

		return []
	}

	/**
	 * Gets all workers registered.
	 */
	public GetAllWorkers (): string[] {
		return Array.from(this._workersRegistered.keys())
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
	public GetFunctionsForWorker (workerId: string): FunctionDescriptionMap {
		return this._workerFunctionLists[workerId] ? this._workerFunctionLists[workerId].functions : { }
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
			if (Object.keys(data[key]).sort().toString() !== Object.keys(exampleFunction).sort().toString()) {
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
	 * Starts a job on a targeted worker.
	 * @param workerId Worker to start job on.
	 * @param req Job to start.
	 */
	public StartJobOnWorker (workerId: string, req: JobStartRequest): JobStartRequestResponse {
		const worker = this._workersRegistered.get(workerId)

		if (!worker) return { status: JobStatus.FAILED_TO_START, details: `Worker ${workerId} does not exist` }

		return { status: JobStatus.STARTING, details: '' }
	}

	private requestSystemInfo (workerId: string): boolean {
		if(!this._systemInfo[workerId]) {
			return true
		} else {
			const lastReceived = this._systemInfo[workerId].lastReceived
			const now = Date.now()

			if ((now - lastReceived.getTime()) >= SYSTEM_INFO_REQUEST_PERIOD) {
				return true
			}
		}

		return false
	}

	private requestFunctionList (workerId: string): boolean {
		if(!this._workerFunctionLists[workerId]) {
			return true
		} else {
			const lastReceived = this._workerFunctionLists[workerId].lastRecieved
			const now = Date.now()

			if ((now - lastReceived.getTime()) >= FUNCTION_LIST_REQUEST_PERIOD) {
				return true
			}
		}

		return false
	}

	private manageState (): void {
		Object.keys(this._lastHeartbeat).forEach((workerId) => {
			if (this._workersRegistered.get(workerId) === WorkerStatus.ONLINE) {
				if (Date.now() - new Date(this._lastHeartbeat[workerId].time).getTime() >= DISCONNECT_TIME) {
					this._workersRegistered.set(workerId, WorkerStatus.OFFLINE)
					logger.info(`Worker ${workerId} disconnected. Last seen: ${this._lastHeartbeat[workerId].time}`)
				}
			}
		})

		/* istanbul ignore next */
		if(this._runManager) {
			this._timeout = setTimeout(() => this.manageState(), STATE_MANAGEMENT_INTERVAL)
		}
	}
}
