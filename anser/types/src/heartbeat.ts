import { ObjectId } from 'mongodb'
import { WorkerCommandsDB } from './db/collections/worker-commands'
import { FunctionDescription } from './function/description'
import { JobStatus } from './job/job'
import { WorkerCommandType } from './worker-commands/worker-commands'

export interface Heartbeat {
	time: number,
	data: HeartbeatDataAny[]
}

export interface SystemInfoData {
	cpu_usage_percent: number,
	ram_available: number,
	ram_used: number,
	disk_capacity: number,
	disk_usage: number
}

export interface CanJobRunData {
	jobId: ObjectId
	canRun: boolean
	status?: JobStatus
	info?: string
}

interface HeartbeatDataBase {
	commandId: ObjectId,
	command: WorkerCommandType,
	data: any
}

export interface HeartbeatDataSystemInfo extends HeartbeatDataBase {
	command: WorkerCommandType.SendSystemInfo,
	data: SystemInfoData
}

export interface HeartbeatDataListFunctions extends HeartbeatDataBase {
	command: WorkerCommandType.ListFunctions,
	data: [string, FunctionDescription][]
}

export interface HeartbeatDataCheckJobCanRun extends HeartbeatDataBase {
	command: WorkerCommandType.CheckJobCanRun,
	data: CanJobRunData
}

export type HeartbeatDataAny = HeartbeatDataSystemInfo | HeartbeatDataListFunctions | HeartbeatDataCheckJobCanRun

export interface HeartbeatResponse {
	commands?: WorkerCommandsDB[]
}

export function BodyIsHeartbeat (body: any): boolean {
	const template: Heartbeat = {
		data: [],
		time: 0
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}
