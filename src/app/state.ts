import { Heartbeat, HeartbeatCommand, HeartbeatCommandSendSystemInfo, HeartbeatCommandType, HeartbeatResponse } from 'anser-types'

/**
 * Stores the state of the controller.
 */
export class State {
	private _workersRegistered: string[]
	private _heartBeats: { [workerId: string]: Heartbeat[] }
	private _lastHeartbeat: { [workerId: string]: Heartbeat }
	constructor () {
		this._workersRegistered = []
		this._heartBeats = { }
		this._lastHeartbeat = { }
	}

	/**
	 * Adds a heartbeat for a worker
	 * @param workerId ID of the worker to add a heartbeat to.
	 * @param heartbeat Heartbeat to add
	 */
	public AddHeartbeat (workerId: string, heartbeat: Heartbeat): HeartbeatResponse {
		const commands: HeartbeatCommand[] = []
		if (this._workersRegistered.indexOf(workerId) === -1) {
			const systemInfoCommand: HeartbeatCommandSendSystemInfo = {
				type: HeartbeatCommandType.SendSystemInfo
			}
			commands.push(systemInfoCommand)
			this._workersRegistered.push(workerId)
			this._heartBeats[workerId] = []
		}
		this._heartBeats[workerId].push(heartbeat)
		this._lastHeartbeat[workerId] = heartbeat
		return { commands }
	}
}
