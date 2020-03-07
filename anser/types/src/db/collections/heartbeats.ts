import { ObjectID } from 'mongodb'
import { Heartbeat } from '../../heartbeat'

export interface HeartbeatsDB extends Heartbeat {
	_id: ObjectID
	workerId: string
}

export type StrippedHeartbeatsDB = Omit<HeartbeatsDB, '_id'>
