import { Heartbeat, HeartbeatCommandType } from 'anser-types'
import { Response } from 'supertest'
import supertest from 'supertest'
import { App } from '../app/app'
import { API_VERSION } from '../app/app'

async function getFromApp (url: string, key: string): Promise<Response> {
	const app = new App('src/__tests__/mocks/auth_keys.txt')
	const res = await supertest(app.app).get(url).set('auth-key', key)
	app.server.close()
	return Promise.resolve(res)
}

async function postToApp (url: string, key: string, body: any): Promise<Response> {
	const app = new App('src/__tests__/mocks/auth_keys.txt')
	const res = await supertest(app.app).post(url).set('auth-key', key).send(body)
	app.server.close()
	return Promise.resolve(res)
}

describe('Controller app: Is alive', () => {
	it('Responds to GET /', async () => {
		const app = new App('src/__tests__/mocks/auth_keys.txt')
		const res = await supertest(app.app).get('/')
		app.server.close()
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
	it('Is not implemented', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/workers`, 'Hello')
		expect(res.status).toEqual(501) // TODO: Not implemented
	})
})

describe('Controller app: Gets all workers of a given status', () => {
	it('Is not implemented', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/workers/status/online`, 'Hello')
		expect(res.status).toEqual(501) // TODO: Not implemented
	})
})

describe('Controller app: Gets all heartbeats for a given worker', () => {
	it('Is not implemented', async () => {
		const res = await getFromApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello')
		expect(res.status).toEqual(501) // TODO: Not implemented
	})
})

describe('Controller app: Adds a heartbeat to a given worker', () => {
	it('Rejects an invalid request body', async () => {
		const res = await postToApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello', { })
		expect(res.status).toEqual(400)
	})

	it('Accepts a valid request body', async () => {
		const heartbeat: Heartbeat = {
			time: new Date()
		}
		const res = await postToApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello', heartbeat)
		expect(res.status).toEqual(200)
		expect(res.body).toEqual([{
			type: HeartbeatCommandType.SendSystemInfo
		}])
	})

	it('Requests system info only once', async () => {
		const heartbeat: Heartbeat = {
			time: new Date()
		}
		const app = new App('src/__tests__/mocks/auth_keys.txt')
		const res1 = await supertest(app.app)
			.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		const res2 = await supertest(app.app)
			.post(`/api/${API_VERSION}/heartbeat/test-worker`).set('auth-key', 'Hello').send(heartbeat)
		expect(res1.status).toEqual(200)
		expect(res1.body).toEqual([{
			type: HeartbeatCommandType.SendSystemInfo
		}])

		expect(res2.status).toEqual(200)
		expect(res2.body).toEqual({ })
		app.server.close()
	})
})
