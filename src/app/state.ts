import {
	Heartbeat,
	HeartbeatCommand,
	HeartbeatCommandSendSystemInfo,
	HeartbeatCommandType,
	HeartbeatResponse,
	logger,
	SystemInfoData
} from 'anser-types'

const SYSTEM_INFO_REQUEST_PERIOD = 60 * 1000 // Every minute
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
	private _runManager: boolean = false
	private _timeout?: NodeJS.Timeout

	constructor () {
		this._heartBeats = { }
		this._lastHeartbeat = { }
		this._systemInfo = { }
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
					if (this.isValidSystemInfoData(command.data)) {
						this._systemInfo[workerId] = {
							data: command.data,
							lastReceived: new Date()
						}
					}
					break
			}
		})
		const commands: HeartbeatCommand[] = []
		if (this.requestSystemInfo(workerId)) {
			const systemInfoCommand: HeartbeatCommandSendSystemInfo = {
				type: HeartbeatCommandType.SendSystemInfo
			}
			commands.push(systemInfoCommand)
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

	private isValidSystemInfoData (data: any): boolean {
		const exampleCommand: SystemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30,
			ram_used: 25
		}

		return Object.keys(data).sort().toString() === Object.keys(exampleCommand).sort().toString()
	}

	private manageState (): void {
		Object.keys(this._lastHeartbeat).forEach((workerId) => {
			if (this._workersRegistered.get(workerId) === WorkerStatus.ONLINE) {
				logger.info(Date.now().toString())
				logger.info(new Date(this._lastHeartbeat[workerId].time).getTime().toString())
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
