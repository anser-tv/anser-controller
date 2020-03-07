import { Collection, connect, Db, MongoClient, ObjectID } from 'mongodb'
import { logger } from '../logger/logger'
import { JobsDB } from './collections'
import { HeartbeatsDB } from './collections/heartbeats'
import { SystemInfoDataDB } from './collections/system-info'
import { WorkerCommandsDB } from './collections/worker-commands'
import { WorkerFunctionsDB } from './collections/worker-functions'
import { WorkersDB } from './collections/workers'

export interface DBCollections {
	JOB: Collection<JobsDB>
	WORKER: Collection<WorkersDB>
	COMMAND: Collection<WorkerCommandsDB>
	WORKER_HEARTBEAT: Collection<HeartbeatsDB>
	WORKER_SYSTEM_INFO: Collection<SystemInfoDataDB>
	WORKER_FUNCTION: Collection<WorkerFunctionsDB>
}

export enum Collections {
	JOBS = 'jobs',
	WORKERS = 'workers',
	WORKER_COMMANDS = 'worker_commands',
	WORKER_HEARTBEATS = 'worker_heartbeats',
	WORKER_SYSTEM_INFO = 'worker_system_info',
	WORKER_FUNCTIONS = 'worker_functions'
}

export function stripId<T> (result: T[]): T[] {
	return result.map((res) => ({ ...res, _id: undefined }))
}

/**
 * Creates a connecion to the Anser database.
 */
export class AnserDatabase {
	public db!: Db
	public collections!: DBCollections

	private client!: MongoClient

	constructor (
		public url: string
	) {	}

	/**
	 * Connects to database.
	 */
	public async Connect (): Promise<void> {
		try {
			this.client = await connect(
				this.url, { useUnifiedTopology: true, forceServerObjectId: true, connectTimeoutMS: 5000 }
			)
			this.db = this.client.db('anser')
			this.setupCollections()
		} catch (err) {
			return Promise.reject(err)
		}
	}

	/**
	 * Disconnects from database.
	 */
	public async Disconnect (): Promise<void> {
		await this.client.close()
	}

	/**
	 * Creates an ObjectID from a string
	 */
	public IdFromString (id: string): ObjectID {
		return new ObjectID(id)
	}

	private setupCollections (): void {
		const jobsCollection = this.db.collection<JobsDB>(Collections.JOBS)
		const workersCollection = this.db.collection<WorkersDB>(Collections.WORKERS)
		const workerCommandsCollection = this.db.collection<WorkerCommandsDB>(Collections.WORKER_COMMANDS)
		const workerHeartbeatCollection = this.db.collection<HeartbeatsDB>(Collections.WORKER_HEARTBEATS)
		const workerSystemInfoCollection = this.db.collection<SystemInfoDataDB>(Collections.WORKER_SYSTEM_INFO)
		const workerFunctionsCollection = this.db.collection<WorkerFunctionsDB>(Collections.WORKER_FUNCTIONS)

		workersCollection.distinct('workerId')

		this.collections = {
			JOB: jobsCollection,
			WORKER: workersCollection,
			COMMAND: workerCommandsCollection,
			WORKER_HEARTBEAT: workerHeartbeatCollection,
			WORKER_SYSTEM_INFO: workerSystemInfoCollection,
			WORKER_FUNCTION: workerFunctionsCollection
		}
	}
}
