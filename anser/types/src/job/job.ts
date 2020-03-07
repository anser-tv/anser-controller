import { Jobs } from '../db'
import { JobRunConfig } from './job-run-config'

export enum TargetType {
	WORKER = 'WORKER',
	GROUP = 'GROUP'
}

export enum JobStatus {
	UNKNOWN = 'UNKNOWN',
	QUEUED = 'QUEUED',
	STARTING = 'STARTING',
	FAILED_TO_START = 'FAILED_TO_START',
	RUNNING = 'RUNNING',
	FAILED = 'FAILED',
	STOPPED = 'STOPPED',
	COMPLETED = 'COMPLETED'
}

export interface JobStartRequestResponse {
	status: JobStatus
	details: string
}

export type JobTarget = { workerId: string } | { groupId: string } | { workerId: string, groupId: string }

export function BodyIsJobRunConfig (body: any): boolean {
	const template: Omit<JobRunConfig, 'GetConfigById' | 'GetInputById' | 'GetOutputById'> = {
		functionId: '',
		inputs: new Map(),
		outputs: new Map(),
		functionConfig: new Map()
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}

/**
 * Stores the state of a Job, is an instace of a function.
 */
export class Job implements Jobs {
	constructor (
		public target: JobTarget,
		public runConfig: JobRunConfig
	) { }

	/**
	 * Checks if this job can be run.
	 * @returns true If the job can be run.
	 */
	public CanRun (): Promise<boolean> {
		return Promise.resolve(false)
	}

	/**
	 * Runs this job.
	 * @returns true If the job started successfully.
	 */
	public Run (): Promise<boolean> {
		return Promise.resolve(false)
	}

	/**
	 * Stops this job.
	 * @returns true If the job stopped successfully.
	 */
	public Stop (): Promise<boolean> {
		return Promise.resolve(false)
	}
}
