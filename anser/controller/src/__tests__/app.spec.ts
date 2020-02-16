import { Heartbeat, HeartbeatCommandType } from 'anser-types'
import { Response } from 'supertest'
import supertest from 'supertest'
import { App } from '../app/app'
import { API_VERSION } from '../app/app'
import { WorkerStatus } from '../app/state'

async function getFromApp (url: string, key: string): Promise<Response> {
	const app = new App('src/__tests__/__mocks__/config_a.json')
	const res = await supertest(app.app).get(url).set('auth-key', key)
	app.Close()
	return Promise.resolve(res)
}

async function postToApp (url: string, key: string, body: any): Promise<Response> {
	const app = new App('src/__tests__/__mocks__/config_a.json')
	const res = await supertest(app.app).post(url).set('auth-key', key).send(body)
	app.Close()
	return Promise.resolve(res)
}

describe('Controller app: Is alive', () => {
	it('Responds to GET /', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json')
		const res = await supertest(app.app).get('/')
		app.Close()
		expect(res.status).toEqual(200)
	})
})

describe('Controller app: Checks authentication', () => {
	it('Denys access with no key', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/auth/check`, '')
		expect(res.status).toEqual(401)
	})

	it('Denys access to bad key', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/auth/check`, 'THIS KEY WILL BE REJECTED')
		expect(res.status).toEqual(401)
	})

	it('Allows access', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/auth/check`, 'Hello')
		expect(res.status).toEqual(200)
	})
})

describe('Controller app: Gets all workers', () => {
	it('Empty when no workers registered', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/workers`, 'Hello')
		expect(res.body).toEqual([])
	})

	it('Gets all workers', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual(['test-worker1', 'test-worker2'])
	})
})

describe('Controller app: Gets all workers of a given status', () => {
	it('Returns empty when no workers registered', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/workers/status/online`, 'Hello')
		expect(res.body).toEqual([])
	})

	it('Return all online workers', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers/status/online`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual(['test-worker1'])
	})

	it('Return all offline workers', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers/status/offline`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual(['test-worker2'])
	})

	it('Rejects an unknown status', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers/status/not_a_status`).set('auth-key', 'Hello')
		app.Close()
		expect(res.status).toEqual(400)
	})
})

describe ('Controller app: Gets worker status', () => {
	it('Gets status for existing worker', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers/test-worker1/status`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual({ status: 'ONLINE'})
	})

	it('Returns NOT_REGISTERED for non-existant worker', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json');
		((app.state as any)._workersRegistered as Map<string, WorkerStatus>) = new Map(
			[['test-worker1', WorkerStatus.ONLINE], ['test-worker2', WorkerStatus.OFFLINE]]
		)
		const res = await supertest(app.app).get(`/api/${API_VERSION}/workers/not_a_worker/status`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual({ status: 'NOT_REGISTERED'})
	})
})

describe('Controller app: Gets all heartbeats for a given worker', () => {
	it('Gets heartbeats', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json')
		app.state.AddHeartbeat('test-worker', { time: new Date('2020/01/31 00:00:00'), data: [] })
		app.state.AddHeartbeat('test-worker', { time: new Date('2020/01/31 01:00:00'), data: [] })
		const res = await supertest(app.app).get(`/api/${API_VERSION}/heartbeats/test-worker`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual([
			{ time: '2020-01-31T00:00:00.000Z', data: [] },
			{ time: '2020-01-31T01:00:00.000Z', data: [] }
		])
	})

	it('Returns empty array for non-existant worker', async () => {
		const app = new App('src/__tests__/__mocks__/config_a.json')
		const res = await supertest(app.app).get(`/api/${API_VERSION}/heartbeats/not_a_worker`).set('auth-key', 'Hello')
		app.Close()
		expect(res.body).toEqual([])
	})
})

describe('Controller app: Adds a heartbeat to a given worker', () => {
	it('Rejects an invalid request body', async () => {
		const res = await postToApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello', { })
		expect(res.status).toEqual(400)
	})

	it('Accepts a valid request body', async () => {
		const heartbeat: Heartbeat = {
			data: [],
			time: new Date()
		}
		const res = await postToApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello', heartbeat)
		expect(res.status).toEqual(200)
		expect(res.body).toEqual({
			commands: [
				{ type: HeartbeatCommandType.SendSystemInfo }
			]
		})
	})

	it('Requests system info only once', async () => {
		const heartbeat: Heartbeat = {
			data: [],
			time: new Date()
		}
		const app = new App('src/__tests__/__mocks__/config_a.json')
		const res1 = await supertest(app.app)
			.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		heartbeat.data = [{
			command: HeartbeatCommandType.SendSystemInfo,
			data: {
				cpu_usage_percent: 50,
				disk_capacity: 50,
				disk_usage: 45,
				ram_available: 40,
				ram_used: 35
			}
		}]
		const res2 = await supertest(app.app)
			.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		app.Close()
		expect(res1.status).toEqual(200)
		expect(res1.body).toEqual({
			commands: [
				{ type: HeartbeatCommandType.SendSystemInfo }
			]
		})

		expect(res2.status).toEqual(200)
		expect(res2.body).toEqual({ })
	})

	it('Requests system info if previous was invalid', async () => {
		const heartbeat: any = {
			data: [],
			time: new Date()
		}
		const app = new App('src/__tests__/__mocks__/config_a.json')
		const res1 = await supertest(app.app)
			.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		heartbeat.data = [{
			command: HeartbeatCommandType.SendSystemInfo,
			data: { }
		}]
		const res2 = await supertest(app.app)
		.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		app.Close()
		expect(res1.status).toEqual(200)
		expect(res1.body).toEqual({
			commands: [
				{ type: HeartbeatCommandType.SendSystemInfo }
			]
		})

		expect(res2.status).toEqual(200)
		expect(res2.body).toEqual({
			commands: [
				{ type: HeartbeatCommandType.SendSystemInfo}
			]
		})
	})
})
