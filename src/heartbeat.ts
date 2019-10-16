export interface IHeartBeat {
	time: Date
}

export function BodyIsHeartBeat (body: any): boolean {
	const template: IHeartBeat = {
		time: new Date()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
