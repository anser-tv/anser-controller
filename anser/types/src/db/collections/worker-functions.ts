import { ObjectID } from 'mongodb'
import { FunctionDescriptionMap } from '../../..'

export interface WorkerFunctions {
	workerId: string
	lastRecieved: number
	functions: FunctionDescriptionMap
}

// tslint:disable-next-line: no-empty-interface
export interface WorkerFunctionsDB extends WorkerFunctions {
	_id: ObjectID
}
