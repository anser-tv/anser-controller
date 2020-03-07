import { ObjectID } from 'mongodb'
import { WorkerStatus } from '../../worker/worker'

export interface WorkersDB {
	_id: ObjectID
	workerId: string
	status: WorkerStatus
}

export type StrippedWorker = Omit<WorkersDB, '_id'>
