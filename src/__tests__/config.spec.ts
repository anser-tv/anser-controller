import { ConfigLoader } from '../config'

describe('config', () => {
	it ('Loads a config from file', () => {
		const loadera = new ConfigLoader('src/__tests__/__mocks__/config_a.json')
		expect(loadera.config.functionsDirectory).toEqual('functions')
		expect(loadera.config.authKeys).toEqual(['0123456789', 'Hello'])
		const loaderb = new ConfigLoader('src/__tests__/__mocks__/config_b.json')
		expect(loaderb.config.functionsDirectory).toEqual('actions')
		expect(loadera.config.authKeys).toEqual(['0123456789', 'Hello'])
	})

	it('Rejects a bad config', () => {
		expect(() => { const loader = new ConfigLoader('src/__tests__/__mocks__/badConfig.json') }).toThrowError()
	})
})
