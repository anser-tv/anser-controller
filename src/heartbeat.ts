export interface IHeartbeat {
	time: Date
}

export interface IHeartbeatResponse {
	commands?: string[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: IHeartbeat = {
		time: new Date()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
