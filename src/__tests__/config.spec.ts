import { ConfigLoader } from '../config'

describe('config', () => {
	it ('Loads a config from file', () => {
		const loader = new ConfigLoader('src/__tests__/__mocks__/config.json')
		expect(loader.config.id).toEqual('dev-worker')
		expect(loader.config.controller).toEqual('127.0.0.1:5001')
	})

	it('Rejects a bad config', () => {
		expect(() => { const loader = new ConfigLoader('src/__tests__/__mocks__/badConfig.json') }).toThrowError()
	})
})
