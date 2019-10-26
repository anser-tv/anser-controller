import {
	Heartbeat,
	HeartbeatCommand,
	HeartbeatCommandSendSystemInfo,
	HeartbeatCommandType,
	HeartbeatResponse,
	SystemInfoData
} from 'anser-types'

const SYSTEM_INFO_REQUEST_PERIOD = 60 * 1000 // Every minute

/**
 * Stores the state of the controller.
 */
export class State {
	private _workersRegistered: string[]
	private _heartBeats: { [workerId: string]: Heartbeat[] }
	private _lastHeartbeat: { [workerId: string]: Heartbeat }
	private _systemInfo: { [workerId: string]: { lastReceived: Date, data: SystemInfoData } }
	constructor () {
		this._workersRegistered = []
		this._heartBeats = { }
		this._lastHeartbeat = { }
		this._systemInfo = { }
	}

	/**
	 * Adds a heartbeat for a worker
	 * @param workerId ID of the worker to add a heartbeat to.
	 * @param heartbeat Heartbeat to add
	 */
	public AddHeartbeat (workerId: string, heartbeat: Heartbeat): HeartbeatResponse {
		if (this._workersRegistered.indexOf(workerId) === -1) {
			this._workersRegistered.push(workerId)
			this._heartBeats[workerId] = []
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
}
