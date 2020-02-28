import { FunctionLoader, FunctionPackageFile } from '../function/loader'
import { logger } from '../logger/logger'

describe('Function Loader', () => {
	it ('Accepts compatible versions', () => {
		const loader = new FunctionLoader('', '1.0.0', logger, true)
		expect((loader as any).isCompatible('1.0.0')).toBe(true)
	})

	it ('Rejects incompatible versions', () => {
		const loader = new FunctionLoader('', '0.0.0', logger, true)
		expect((loader as any).isCompatible('1.0.0')).toBe(false)
	})

	it ('Requires both main, anser, and version', () => {
		const loader = new FunctionLoader('', 'v0.0', logger, true)
		let file: FunctionPackageFile = {

		}
		expect((loader as any).validateFile(file)).toBe(false)

		file = {
			main: 'index.js'
		}
		expect((loader as any).validateFile(file)).toBe(false)

		file = {
			main: 'index.js',
			anser: { }
		}
		expect((loader as any).validateFile(file)).toBe(false)

		file = {
			main: 'index.js',
			anser: {
				targetVersion: 'v0.0'
			}
		}
		expect((loader as any).validateFile(file)).toBe(true)
	})

	it ('Accepts Anser package', () => {
		const loader = new FunctionLoader('', 'v0.0', logger, true)
		expect(loader.IsAnserPackage('src/__tests__/__mocks__/valid.json')).toBe(true)
	})

	it ('Rejects other packages', () => {
		const loader = new FunctionLoader('', 'v0.0', logger, true)
		expect(loader.IsAnserPackage('src/__tests__/__mocks__/invalid.json')).toBe(false)
		expect(loader.IsAnserPackage('src/__tests__/__mocks__/doesntexist.json')).toBe(false)
	})

	it ('Gets dependencies from file', () => {
		const loader = new FunctionLoader('', 'v0.0', logger, true)
		expect(loader.GetDependenciesFromPackageFile('src/__tests__/__mocks__/valid.json')).toEqual([
			'somePackage', 'anotherPackage'
		])

		expect(loader.GetDependenciesFromPackageFile('src/__tests__/__mocks__/invalid.json')).toEqual(undefined)
		expect(loader.GetDependenciesFromPackageFile('src/__tests__/__mocks__/doesntexist.json')).toEqual(undefined)
	})

	it ('Returns functions', () => {
		const loader = new FunctionLoader('', 'v0.0', logger, true)
		loader.loadedFunctions = {
			'test-function': {
				name: '',
				packageName: '',
				author: '',
				version: '',
				targetVersion: '',
				main: '',
				config: [],
				outputs: [],
				inputs: []
			}
		}

		expect(loader.GetFunctions()).toEqual({
			'test-function': {
				name: '',
				packageName: '',
				author: '',
				version: '',
				targetVersion: '',
				main: '',
				config: [],
				outputs: [],
				inputs: []
			}
		})
	})
})
