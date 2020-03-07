import { ObjectID } from 'mongodb'
import { WorkerCommand } from '../../worker-commands/worker-commands'

export interface WorkerCommandsDB {
	_id: ObjectID
	command: WorkerCommand
}
