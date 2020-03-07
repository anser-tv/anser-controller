import { ObjectID } from 'mongodb'
import { JobTarget } from '../../job/job'
import { JobRunConfig } from '../../job/job-run-config'

export interface Jobs {
	target: JobTarget
	runConfig: JobRunConfig
}

export interface JobsDB extends Jobs {
	_id: ObjectID
}
