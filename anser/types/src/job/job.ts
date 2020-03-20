import { ObjectId } from 'mongodb'
import { Jobs } from '../db'
import { JobRunConfig, JobRunConfigJSON } from './job-run-config'

export enum TargetType {
	WORKER = 'WORKER',
	GROUP = 'GROUP',
	WORKER_AND_GROUP = 'WORKER_AND_GROUP'
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
	jobId?: ObjectId
	status: JobStatus
	details: string
}

export interface JobTargetBase {
	type: TargetType
}

export interface JobTargetWorker {
	type: TargetType.WORKER
	workerId: string
}

export interface JobTargetGroup {
	type: TargetType.GROUP
	groupId: string
}

export interface JobTargetWorkerAndGroup {
	type: TargetType.WORKER_AND_GROUP,
	workerId: string,
	groupId: string
}

export type JobTarget = JobTargetWorker | JobTargetGroup | JobTargetWorkerAndGroup

export function BodyIsJobRunConfig (body: any): boolean {
	const template: JobRunConfigJSON = {
		functionId: '',
		inputs: [],
		outputs: [],
		functionConfig: []
	}

	return Object.keys(body).sort().toString() === Object.keys(template).sort().toString()
}

/**
 * Returns true if a job is in any state that indicates that it is running.
 * @param status Status of the job.
 */
export function JobIsInRunningState (status: JobStatus): boolean {
	return status === JobStatus.STARTING || status === JobStatus.RUNNING
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
