import { FunctionDescriptionMap } from './function/description'
import { JobStatus } from './job/job'
import { WorkerCommand, WorkerCommandType } from './worker-commands/worker-commands'

export interface Heartbeat {
	time: number,
	data: HeartbeatDataAny[]
}

interface HeartbeatDataBase {
	command: WorkerCommandType,
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
	command: WorkerCommandType.SendSystemInfo,
	data: SystemInfoData
}

export interface HeartbeatDataListFunctions extends HeartbeatDataBase {
	command: WorkerCommandType.ListFunctions,
	data: FunctionDescriptionMap
}

export interface HeartbeatDataCheckJobCanRun extends HeartbeatDataBase {
	command: WorkerCommandType.CheckJobCanRun,
	data: {
		canRun: boolean
		status: JobStatus
	}
}

export type HeartbeatDataAny = HeartbeatDataSystemInfo | HeartbeatDataListFunctions | HeartbeatDataCheckJobCanRun

export interface HeartbeatResponse {
	commands?: WorkerCommand[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: Heartbeat = {
		data: [],
		time: 0
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
