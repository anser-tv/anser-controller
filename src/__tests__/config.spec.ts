import { ConfigLoader } from '../config'

describe('config', () => {
	it ('Loads a config from file', () => {
		const loadera = new ConfigLoader('src/__tests__/__mocks__/config_a.json')
		expect(loadera.config.id).toEqual('dev-worker')
		expect(loadera.config.controller).toEqual('127.0.0.1:5001')
		expect(loadera.config.functionsDirectory).toEqual('functions')
		const loaderb = new ConfigLoader('src/__tests__/__mocks__/config_b.json')
		expect(loaderb.config.id).toEqual('dev-worker')
		expect(loaderb.config.controller).toEqual('127.0.0.1:5001')
		expect(loaderb.config.functionsDirectory).toEqual('actions')
	})

	it('Rejects a bad config', () => {
		expect(() => { const loader = new ConfigLoader('src/__tests__/__mocks__/badConfig.json') }).toThrowError()
	})
})
