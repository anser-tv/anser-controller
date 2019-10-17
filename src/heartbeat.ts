export interface Heartbeat {
	time: Date
}

export interface HeartbeatResponse {
	commands?: string[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: Heartbeat = {
		time: new Date()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
