import {
	CanJobRunData,
	FunctionLoader,
	Heartbeat,
	HeartbeatDataAny,
	HeartbeatDataCheckJobCanRun,
	HeartbeatDataListFunctions,
	HeartbeatDataSystemInfo,
	HeartbeatResponse,
	JobStatus,
	logger,
	strict,
	SystemInfoData,
	WorkerCommandType,
	JobRunConfigFromJSON
} from 'anser-types'
import { post } from 'request-promise'
import { fsSize } from 'systeminformation'
import { currentLoad } from 'systeminformation'
import { mem } from 'systeminformation'

const KEEPALIVE_INTERVAL = 1000
const ANSER_VERSION = '1.0.0'

/**
 * Represents a worker.
 * @property id: Unique worker ID.
 * @property controller: Hostname of this workers' controller.
 */
export class AnserWorker {
	private _protocol: string = 'https'
	private _running: boolean = false
	private _connected: boolean = false
	private _nextHeartbeat: Heartbeat = { time: Date.now(), data: [] }
	private _functionLoader: FunctionLoader

	constructor (
		public id: string,
		private _controller: string,
		private _functionDirectory: string,
		private _authKey: string,
		private _debug?: boolean
	) {
		/* istanbul ignore next */
		if (this._debug) {
			this._protocol = 'http'
		}

		this._functionLoader = new FunctionLoader(this._functionDirectory, ANSER_VERSION, logger)
	}

	/**
	 * Starts this worker.
	 */
	public Start (): void {
		this._running = true
		logger.info(`Worker ${this.id} started`)
		this.keepAlive()
	}

	/* istanbul ignore next */
	private keepAlive (): void {
		logger.info(`Sending heartbeat to ${this._protocol}://${this._controller}/anser/heartbeat/${this.id}`)
		this._nextHeartbeat.time = Date.now()
		post(
			`${this._protocol}://${this._controller}/anser/heartbeat/${this.id}`,
			{
				body: this._nextHeartbeat,
				json: true,
				resolveWithFullResponse: true,
				headers: { authKey: this._authKey, targetVersion: ANSER_VERSION }
			}
		).then((data: { body: HeartbeatResponse }) => {
			if (!this._connected) {
				logger.info(`Connected to controller`)
			}
			this._connected = true
			this.resetHeartbeat()
			if (data) {
				this.processHeartbeatResponse(data.body).catch((err) => {
					if (err) throw err
				})
			}
		}).catch ( (err) => {
			if (this._connected) {
				logger.info(`Disconnected from controller! ${err}`)
			}
			logger.error(err.message)
			this._connected = false
		})

		if (this._running) {
			setTimeout(() => { this.keepAlive() }, KEEPALIVE_INTERVAL)
		}
	}

	private async processHeartbeatResponse (resp: HeartbeatResponse): Promise<boolean> {
		if (resp && resp.commands && resp.commands.length) {
			const actions = resp.commands.map(async (cmd) => {
				logger.info(`Received command: ${cmd.command.type}`)
				let data: HeartbeatDataAny | undefined
				switch(cmd.command.type) {
					case WorkerCommandType.SendSystemInfo:
						data = strict<HeartbeatDataSystemInfo>({
							commandId: cmd._id,
							command: WorkerCommandType.SendSystemInfo,
							data: await this.getSystemInfo()
						})
						break
					case WorkerCommandType.ListFunctions:
						data = strict<HeartbeatDataListFunctions>({
							commandId: cmd._id,
							command: WorkerCommandType.ListFunctions,
							data: Array.from(this._functionLoader.GetFunctions().entries())
						})
						break
					case WorkerCommandType.CheckJobCanRun:
						const runConfig = JobRunConfigFromJSON(cmd.command.job)
						const canRun = await this._functionLoader.CheckJobCanRun(runConfig)
						let startJob: Pick<CanJobRunData, 'canRun' | 'info' | 'status'> | undefined
						if (cmd.command.startImmediate && canRun.canRun) {
							startJob = await this._functionLoader.StartJob(runConfig)
						}
						data = strict<HeartbeatDataCheckJobCanRun>({
							commandId: cmd._id,
							command: WorkerCommandType.CheckJobCanRun,
							data: {
								jobId: cmd.command.jobId,
								canRun: canRun.canRun,
								status: canRun ? startJob ? startJob.status : JobStatus.FAILED_TO_START : JobStatus.FAILED_TO_START,
								info: `${canRun.info ? `Can run: ${canRun.info}` : '' }` + `${startJob && startJob.info ? ` StartJob: ${startJob.info}` : '' }`
							}
						})
						break
				}
				if (data) {
					if (this._nextHeartbeat.data && this._nextHeartbeat.data.length >= 0) {
						this._nextHeartbeat.data.push(data)
					} else {
						this._nextHeartbeat.data = [data]
					}
				}
			})
			await Promise.all(actions)
			return Promise.resolve(true)
		} else {
			return Promise.resolve(false)
		}
	}

	/* istanbul ignore next */
	private async getSystemInfo (): Promise<SystemInfoData> {
		const cpuData = await currentLoad()
		const memData = await mem()
		const diskData = await fsSize()
		const diskTotalSize: number = diskData.reduce((prev, cur) => {
			return prev + cur.size
		}, 0)
		const diskUsage: number = diskData.reduce((prev, cur) => {
			return prev + cur.used
		}, 0)
		return {
			cpu_usage_percent: cpuData.avgload,
			disk_capacity: diskTotalSize,
			disk_usage: diskUsage,
			ram_available: memData.total,
			ram_used: memData.used
		}
	}

	/* istanbul ignore next */
	private resetHeartbeat (): void {
		this._nextHeartbeat = { time: Date.now(), data: [] }
	}
}
