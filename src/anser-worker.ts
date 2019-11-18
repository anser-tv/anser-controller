import { Heartbeat, HeartbeatCommandType, HeartbeatDataSystemInfo, HeartbeatResponse, logger, SystemInfoData } from 'anser-types'
import { post } from 'request-promise'
import { fsSize } from 'systeminformation'
import { currentLoad } from 'systeminformation'
import { mem } from 'systeminformation'

const KEEPALIVE_INTERVAL = 1000
const API_VERSION = 'v1.0'

/**
 * Represents a worker.
 * @property id: Unique worker ID.
 * @property controller: Hostname of this workers' controller.
 */
export class AnserWorker {
	private _protocol: string = 'https'
	private _running: boolean = false
	private _connected: boolean = false
	private _nextHeartbeat: Heartbeat = { time: new Date(), data: [] }
	constructor (
		public id: string,
		public controller: string,
		public debug?: boolean
	) {
		/* istanbul ignore next */
		if (this.debug) {
			this._protocol = 'http'
		}
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
		logger.info(`Sending heartbeat to ${this._protocol}://${this.controller}/heartbeat/${this.id}`)
		this._nextHeartbeat.time = new Date()
		post(
			`${this._protocol}://${this.controller}/api/${API_VERSION}/heartbeat/${this.id}`,
			{ body: this._nextHeartbeat, json: true, resolveWithFullResponse: true }
		).then((data: HeartbeatResponse) => {
			if (!this._connected) {
				logger.info(`Connected to controller`)
			}
			this._connected = true
			this.resetHeartbeat()
			if (data) {
				this.processHeartbeatResponse(data).catch((err) => {
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
		if (resp.commands && resp.commands.length) {
			const actions = resp.commands.map(async (command) => {
				switch(command.type) {
					case HeartbeatCommandType.SendSystemInfo:
						logger.info(`Received command: SendSystemInfo`)
						const data: HeartbeatDataSystemInfo = {
							command: HeartbeatCommandType.SendSystemInfo,
							data: await this.getSystemInfo()
						}
						if (this._nextHeartbeat.data && this._nextHeartbeat.data.length >= 0) {
							this._nextHeartbeat.data.push(data)
						} else {
							this._nextHeartbeat.data = [data]
						}
						break
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
		this._nextHeartbeat = { time: new Date(), data: [] }
	}
}
