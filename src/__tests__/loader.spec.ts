import { ConfigType, VideoIOType } from '../function/description'
import { FunctionLoader } from '../function/loader'
import { logger } from '../logger/logger'

describe('Function Loader', () => {
	it ('Accepts compatible versions', () => {
		const loader = new FunctionLoader('', 'v1.0')
		expect((loader as any).isCompatible('v1.0')).toBe(true)
	})

	it ('Rejects incompatible versions', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).isCompatible('v1.0')).toBe(false)
	})

	it ('Loads functions', () => {
		const loader = new FunctionLoader('src/__tests__/__mocks__/validFunctions', 'v0.0', logger, 'description.json')
		expect(loader.GetFunctions()).toEqual({
			'ANSER_FUNCTION_TEST:TOM_LEE:5aa7ddcb4ee7466a4421b06da43ca4fe': {
				author: 'Tom Lee',
				config: [
					{
						id: 'someValue',
						name: 'Some Value',
						type: ConfigType.STRING
					},
					{
						id: 'anotherValue',
						name: 'Another Value',
						type: ConfigType.INTEGER
					}
				],
				inputs: [
					{
						_aspectRatio: '16:9',
						_format: '1080i50',
						id: 'input1',
						name: 'Input 1',
						type: VideoIOType.RTMP
					}
				],
				mainFile: 'dist/index.js',
				name: 'anser-function-test',
				outputs: [
					{
						_aspectRatio: '4:3',
						_format: '1080p25',
						id: 'output1',
						name: 'Output 1',
						type: VideoIOType.RTMP
					}
				],
				targetVersion: 'v0.0',
				version: '1.0.0'

			}
		})
	})

	it ('Tries to load functions from empty files', () => {
		const loader = new FunctionLoader('src/__tests__/__mocks__/noFunctionPackageFile', 'v0.0', logger, 'description.json')
		expect(loader.GetFunctions()).toEqual({ })
	})

	it ('Rejects package.json with no dependencies', () => {
		const loader = new FunctionLoader(
			'src/__tests__/__mocks__/noFunctionDependencies', 'v0.0', logger, 'description.json'
		)
		expect(loader.GetFunctions()).toEqual({ })
	})

	it ('Rejects bad config values', () => {
		const loader = new FunctionLoader('src/__tests__/__mocks__/invalidFunctions', 'v0.0', logger, 'description.json')
		expect(loader.GetFunctions()).toEqual({
			'ANSER_FUNCTION_BAD_VIDEO_IO:TOM_LEE:25d8965ce98475368485db9c7e7b5078': {
				author: 'Tom Lee',
				config: [
					{
						id: 'someValue',
						name: 'Some Value',
						type: ConfigType.STRING
					},
					{
						id: 'anotherValue',
						name: 'Another Value',
						type: ConfigType.INTEGER
					}
				],
				inputs: [],
				mainFile: 'dist/index.js',
				name: 'anser-function-bad-video-io',
				outputs: [
					{
						_aspectRatio: '4:3',
						_format: '1080p25',
						id: 'output1',
						name: 'Output 1',
						type: VideoIOType.RTMP
					}
				],
				targetVersion: 'v0.0',
				version: '1.0.0'

			}
		})
	})

	it ('Handles missing anser field', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			name: 'test-function',
			version: 'v1.0'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: '',
			version: 'v1.0'
		})
	})

	it ('Rejects unknown config type', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: [
						{
							id: 'some-config',
							name: 'Some Config',
							type: 'some junk'
						}
					]
				},
				targetVersion: 'v0.0'
			},
			name: 'test-function',
			version: 'v1.0'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: 'v0.0',
			version: 'v1.0'
		})
	})

	it ('Rejects missing config name', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: [
						{
							id: 'some-config',
							type: 'string'
						}
					]
				},
				targetVersion: 'v0.0'
			},
			name: 'test-function',
			version: 'v1.0'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: 'v0.0',
			version: 'v1.0'
		})
	})

	it ('Rejects missing config id', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: [
						{
							name: 'Some Config',
							type: 'string'
						}
					]
				},
				targetVersion: 'v0.0'
			},
			name: 'test-function',
			version: 'v1.0'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: 'v0.0',
			version: 'v1.0'
		})
	})

	it ('Rejects missing config type', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: [
						{
							id: 'some-config',
							name: 'Some Config'
						}
					]
				},
				targetVersion: 'v0.0'
			},
			name: 'test-function',
			version: 'v1.0'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: 'v0.0',
			version: 'v1.0'
		})
	})

	it ('Handles missing package version number', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: [
						{
							id: 'some-config',
							name: 'Some Config'
						}
					]
				},
				targetVersion: 'v0.0'
			},
			name: 'test-function'
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: 'test-function',
			outputs: [],
			targetVersion: 'v0.0',
			version: ''
		})
	})

	it ('Handles missing package name', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: {
				description: {
					config: []
				},
				targetVersion: 'v0.0'
			}
		})).toEqual({
			author: '',
			config: [],
			inputs: [],
			mainFile: '',
			name: '',
			outputs: [],
			targetVersion: 'v0.0',
			version: ''
		})
	})

	it ('Rejects missing video IO format', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseVideoIO({
			aspectRatio: 'any',
			id: 'test-io',
			name: 'Test IO',
			type: 'RTMP'
		})).toEqual([])
	})

	it ('Rejects missing video IO id', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseVideoIO({
			aspectRatio: 'any',
			format: '1080i50',
			name: 'Test IO',
			type: 'RTMP'
		})).toEqual([])
	})

	it ('Rejects missing video IO aspect ratio', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseVideoIO({
			format: '1080i50',
			name: 'Test IO',
			type: 'RTMP'
		})).toEqual([])
	})

	it ('Parses config types', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseConfigType()).toEqual(ConfigType.UNKNOWN)
		expect((loader as any).parseConfigType('dropdown')).toEqual(ConfigType.DROPDOWN)
		expect((loader as any).parseConfigType('DROPDOWN')).toEqual(ConfigType.DROPDOWN)
		expect((loader as any).parseConfigType('string')).toEqual(ConfigType.STRING)
		expect((loader as any).parseConfigType('STRING')).toEqual(ConfigType.STRING)
		expect((loader as any).parseConfigType('integer')).toEqual(ConfigType.INTEGER)
		expect((loader as any).parseConfigType('INTEGER')).toEqual(ConfigType.INTEGER)
		expect((loader as any).parseConfigType('boolean')).toEqual(ConfigType.BOOLEAN)
		expect((loader as any).parseConfigType('BOOLEAN')).toEqual(ConfigType.BOOLEAN)
		expect((loader as any).parseConfigType('anything else')).toEqual(ConfigType.UNKNOWN)
	})

	it ('Parses VideoIO types', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseVideoIOType()).toEqual(VideoIOType.UNKNOWN)
		expect((loader as any).parseVideoIOType('rtmp')).toEqual(VideoIOType.RTMP)
		expect((loader as any).parseVideoIOType('RTMP')).toEqual(VideoIOType.RTMP)
		expect((loader as any).parseVideoIOType('anything else')).toEqual(VideoIOType.UNKNOWN)
	})
})
