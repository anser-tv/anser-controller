import {
	AnserDatabase,
	DBCollections,
	Heartbeat,
	strict,
	stripId,
	StrippedHeartbeatsDB,
	WorkerCommand,
	WorkerCommandType,
	WorkerStatus
} from 'anser-types'
import { Response } from 'supertest'
import supertest from 'supertest'
import { App } from '../app/app'
import { ANSER_VERSION } from '../app/app'

let database: AnserDatabase
let app: App

beforeEach(async () => {
	if (database) await database.Disconnect()
	database = new AnserDatabase(process.env.MONGO_URL as string)
	await database.Connect()
	app = new App('src/__tests__/__mocks__/config_a.json', global.process.env.MONGO_URL as string, true)
	await app.Start()
})

afterEach(async () => {
	await app.Stop()
	for (const key in database.collections) {
		if (database.collections[(key as keyof DBCollections)]) {
			const k = key as keyof DBCollections
			try {
				await database.collections[k].drop()
			} catch (_err) { /* no-op */ }
		}
	}
	await database.Disconnect()
})

async function getFromApp (url: string, key: string, version: string): Promise<Response> {
	try {
		const res = await supertest(app.app).get(url).set('authKey', key).set('targetVersion', version)
		app.Close()
		return Promise.resolve(res)
	} catch (err) {
		return Promise.resolve(err)
	}
}

async function postToApp (url: string, key: string, version: string, body: any): Promise<Response> {
	const res = await supertest(app.app).post(url).set('authKey', key).set('targetVersion', version).send(body)
	app.Close()
	return Promise.resolve(res)
}

describe('Controller app: Is alive', () => {
	it('Responds to GET /', async () => {
		const res = await supertest(app.app).get('/')
		app.Close()
		expect(res.status).toEqual(200)
	})
})

describe('Controller app: Checks authentication', () => {
	it('Denys access with no key', async () => {
		const res = await getFromApp(`/anser/auth/check`, '', ANSER_VERSION)
		expect(res.status).toEqual(401)
	})

	it('Denys access to bad key', async () => {
		const res = await getFromApp(`/anser/auth/check`, 'THIS KEY WILL BE REJECTED', ANSER_VERSION)
		expect(res.status).toEqual(401)
	})

	it('Allows access', async () => {
		const res = await getFromApp(`/anser/auth/check`, 'Hello', ANSER_VERSION)
		expect(res.status).toEqual(200)
	})
})

describe('Controller app: Checks valid version', () => {
	it('Accepts valid version', async () => {
		const res = await getFromApp(`/anser/auth/check`, 'Hello', ANSER_VERSION)
		expect(res.status).toEqual(200)
	})
})

describe('Controller app: Gets all workers', () => {
	it('Empty when no workers registered', async () => {
		const res = await getFromApp(`/anser/workers`, 'Hello', ANSER_VERSION)
		expect(res.body).toEqual([])
	})

	it('Gets all workers', async () => {
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker1', status: WorkerStatus.ONLINE }
		)
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker2', status: WorkerStatus.OFFLINE }
		)
		const res = await supertest(app.app).get(`/anser/workers`).set('authKey', 'Hello').set('targetVersion', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual(['test-worker1', 'test-worker2'])
	})
})

describe('Controller app: Gets all workers of a given status', () => {
	it('Returns empty when no workers registered', async () => {
		const res = await getFromApp(`/anser/workers/status/online`, 'Hello', ANSER_VERSION)
		expect(res.body).toEqual([])
	})

	it('Return all online workers', async () => {
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker1', status: WorkerStatus.ONLINE }
		)
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker2', status: WorkerStatus.OFFLINE }
		)
		const res = await getFromApp(`/anser/workers/status/online`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual(['test-worker1'])
	})

	it('Return all offline workers', async () => {
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker1', status: WorkerStatus.ONLINE }
		)
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker2', status: WorkerStatus.OFFLINE }
		)
		const res = await getFromApp(`/anser/workers/status/offline`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual(['test-worker2'])
	})

	it('Rejects an unknown status', async () => {
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker1', status: WorkerStatus.ONLINE }
		)
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker2', status: WorkerStatus.OFFLINE }
		)
		const res = await getFromApp(`/anser/workers/status/not_a_status`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.status).toEqual(400)
	})
})

describe ('Controller app: Gets worker status', () => {
	it('Gets status for existing worker', async () => {
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker1', status: WorkerStatus.ONLINE }
		)
		await database.collections.WORKER.insertOne(
			{ workerId: 'test-worker2', status: WorkerStatus.OFFLINE }
		)
		const res = await getFromApp(`/anser/workers/test-worker1/status`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual({ status: 'ONLINE'})
	})

	it('Returns NOT_REGISTERED for non-existant worker', async () => {
		const res = await getFromApp(`/anser/workers/test-worker1/status`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual({ status: 'NOT_REGISTERED'})
	})
})

describe('Controller app: Gets all heartbeats for a given worker', () => {
	it('Gets heartbeats', async () => {
		await app.state.AddHeartbeat('test-worker', { time: 0, data: [] })
		await app.state.AddHeartbeat('test-worker', { time: 0, data: [] })
		const res = await getFromApp(`/anser/heartbeats/test-worker`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(stripId(res.body)).toEqual(
			strict<StrippedHeartbeatsDB[]>([
				strict<StrippedHeartbeatsDB>({ time: 0, data: [], workerId: 'test-worker' }),
				strict<StrippedHeartbeatsDB>({ time: 0, data: [], workerId: 'test-worker' })
			])
		)
	})

	it('Returns empty array for non-existant worker', async () => {
		const res = await getFromApp(`/anser/heartbeats/test-worker`, 'Hello', ANSER_VERSION)
		app.Close()
		expect(res.body).toEqual([])
	})
})

describe('Controller app: Adds a heartbeat to a given worker', () => {
	it('Rejects an invalid request body', async () => {
		const res = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, { })
		expect(res.status).toEqual(400)
	})

	it('Accepts a valid request body', async () => {
		const heartbeat: Heartbeat = {
			data: [],
			time: 0
		}
		const res = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, heartbeat)
		expect(res.status).toEqual(200)
		expect(res.body.commands).toContainEqual(
			strict<WorkerCommand>({ commandId: '', type: WorkerCommandType.SendSystemInfo })
		)
	})

	it('Requests system info only once', async () => {
		const heartbeat: Heartbeat = {
			data: [],
			time: 0
		}
		const res1 = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, heartbeat)
		heartbeat.data = [{
			command: WorkerCommandType.SendSystemInfo,
			data: {
				cpu_usage_percent: 50,
				disk_capacity: 50,
				disk_usage: 45,
				ram_available: 40,
				ram_used: 35
			}
		}]
		const res2 = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, heartbeat)
		app.Close()
		expect(res1.status).toEqual(200)
		expect(res1.body.commands).toContainEqual(
			strict<WorkerCommand>({ commandId: '', type: WorkerCommandType.SendSystemInfo })
		)

		expect(res2.status).toEqual(200)
		expect(res2.body.commands).not.toContainEqual(
			strict<WorkerCommand>({ commandId: '', type: WorkerCommandType.SendSystemInfo })
		)
	})

	it('Requests system info if previous was invalid', async () => {
		const heartbeat: any = {
			data: [],
			time: new Date()
		}
		const res1 = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, heartbeat)
		heartbeat.data = [{
			command: WorkerCommandType.SendSystemInfo,
			data: { }
		}]
		const res2 = await postToApp(`/anser/heartbeat/test-worker`, 'Hello', ANSER_VERSION, heartbeat)
		app.Close()
		expect(res1.status).toEqual(200)
		expect(res1.body.commands).toContainEqual(
			strict<WorkerCommand>({ commandId: '', type: WorkerCommandType.SendSystemInfo })
		)

		expect(res2.status).toEqual(200)
		expect(res2.body.commands).toContainEqual(
			strict<WorkerCommand>({ commandId: '', type: WorkerCommandType.SendSystemInfo })
		)
	})
})
