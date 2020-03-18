import { ObjectID } from 'mongodb'
import { JobStatus, JobTarget } from '../../job/job'
import { JobRunConfig } from '../../job/job-run-config'

export interface Jobs {
	target: JobTarget
	runConfig: JobRunConfig
}

export interface JobsDB extends Jobs {
	_id: ObjectID
	status: JobStatus
	info?: string
}

export type StrippedJobsDB = Omit<JobsDB, '_id'>
