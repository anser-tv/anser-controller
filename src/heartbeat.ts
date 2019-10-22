import { HeartbeatCommand, HeartbeatCommandType } from './heartbeat-commands/heartbeat-commands'

export interface Heartbeat {
	time: Date,
	data?: HeartbeatDataAny[]
}

interface HeartbeatDataBase {
	command: HeartbeatCommandType,
	data: any
}

export interface SystemInfoData {
	cpu_usage_percent: number,
	ram_available: number,
	ram_used: number,
	disk_capacity: number,
	disk_usage: number
}

export interface HeartbeatDataSystemInfo extends HeartbeatDataBase {
	command: HeartbeatCommandType.SendSystemInfo,
	data: SystemInfoData
}

export type HeartbeatDataAny = HeartbeatDataSystemInfo

export interface HeartbeatResponse {
	commands?: HeartbeatCommand[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: Heartbeat = {
		time: new Date()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
