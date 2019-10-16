import { Response } from 'supertest'
import supertest from 'supertest'
import { App } from '../app/app'
import { API_VERSION } from '../app/app'

async function getFromApp (url: string, key: string): Promise<Response> {
	const app = new App()
	const res = await supertest(app.app).get(url).set('auth-key', key)
	app.server.close()
	return Promise.resolve(res)
}

async function postToApp (url: string, key: string, body: any): Promise<Response> {
	const app = new App()
	const res = await supertest(app.app).post(url).set('auth-key', key).send(body)
	app.server.close()
	return Promise.resolve(res)
}

describe('Controller app: Is alive', () => {
	it('Responds to GET /', async () => {
		const app = new App()
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
	it('Is not implemented', async () => {
		const res = await postToApp(`/api/${API_VERSION}/heartbeat/test-worker`, 'Hello', { })
		expect(res.status).toEqual(501) // TODO: Not implemented
	})
})
