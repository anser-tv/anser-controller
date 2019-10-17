import { HeartbeatCommand } from './heartbeat-commands/heartbeat-commands'

export interface Heartbeat {
	time: Date
}

export interface HeartbeatResponse {
	commands?: HeartbeatCommand[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: Heartbeat = {
		time: new Date()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
