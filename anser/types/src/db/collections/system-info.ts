import { ObjectID } from 'mongodb'
import { SystemInfoData } from '../../..'

export interface SystemInfo {
	workerId: string
	lastReceived: number
	data: SystemInfoData
}

export interface SystemInfoDataDB extends SystemInfo {
	_id: ObjectID
}
