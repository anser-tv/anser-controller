import { ConfigType, FunctionDescription, VideoIOType } from '../function/description'
import { FunctionLoader, FunctionPackageFile } from '../function/loader'
import { logger } from '../logger/logger'
import { strict} from '../strict'

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
			'ANSER_FUNCTION_TEST:ANSER_TEST_FUNCTION:TOM_LEE:0133038320b002572b796074b8b7b434': {
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
				name: 'Anser Test Function',
				outputs: [
					{
						_aspectRatio: '4:3',
						_format: '1080p25',
						id: 'output1',
						name: 'Output 1',
						type: VideoIOType.RTMP
					}
				],
				packageName: 'anser-function-test',
				requirePath: 'src/__tests__/__mocks__/validFunctions/node_modules/anser-function-test/description.json/dist/index.js',
				targetVersion: 'v0.0',
				version: 'v1.0'

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
			'ANSER_FUNCTION_BAD_VIDEO_IO:ANSER_TEST_FUNCTION:TOM_LEE:efbb29cd89480f6feb046fe222b904f3': {
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
				name: 'Anser Test Function',
				outputs: [
					{
						_aspectRatio: '4:3',
						_format: '1080p25',
						id: 'output1',
						name: 'Output 1',
						type: VideoIOType.RTMP
					}
				],
				packageName: 'anser-function-bad-video-io',
				requirePath: 'src/__tests__/__mocks__/invalidFunctions/node_modules/anser-function-bad-video-io/description.json/dist/index.js',
				targetVersion: 'v0.0',
				version: 'v1.0'

			}
		})
	})

	it ('Handles missing anser field', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			name: 'test-function',
			version: 'v1.0'
		}, 'node_modules/anser', 'package.json')).toEqual([])
	})

	it ('Rejects unknown config type', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile(strict<FunctionPackageFile>({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [
						{
							id: 'some-config',
							name: 'Some Config',
							type: 'some junk'
						}
					],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0',
					version: 'v1.0'
				}}
			]
		}), 'node_modules/anser', 'test-file')).toEqual([{
			author: 'Tom Lee',
			config: [],
			inputs: [],
			mainFile: 'dist/index.js',
			name: 'test-function',
			outputs: [
				{
					_aspectRatio: '16:9',
					_format: '1080i50',
					id: 'input1',
					name: 'Input 1',
					type: VideoIOType.RTMP
				}
			],
			packageName: 'test-file',
			requirePath: 'node_modules/anser/dist/index.js',
			targetVersion: 'v0.0',
			version: 'v1.0'
		}])
	})

	it ('Rejects missing config name', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile(strict<FunctionPackageFile>({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [
						{
							id: 'some-config',
							type: 'string'
						}
					],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0',
					version: 'v1.0'
				}}
			]
		}), 'node_modules/anser', 'test-file')).toEqual([{
			author: 'Tom Lee',
			config: [],
			inputs: [],
			mainFile: 'dist/index.js',
			name: 'test-function',
			outputs: [
				{
					_aspectRatio: '16:9',
					_format: '1080i50',
					id: 'input1',
					name: 'Input 1',
					type: VideoIOType.RTMP
				}
			],
			packageName: 'test-file',
			requirePath: 'node_modules/anser/dist/index.js',
			targetVersion: 'v0.0',
			version: 'v1.0'
		}])
	})

	it ('Rejects missing config id', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile(strict<FunctionPackageFile>({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [
						{
							name: 'Some config',
							type: 'string'
						}
					],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0',
					version: 'v1.0'
				}}
			]
		}), 'node_modules/anser', 'test-file')).toEqual([{
			author: 'Tom Lee',
			config: [],
			inputs: [],
			mainFile: 'dist/index.js',
			name: 'test-function',
			outputs: [
				{
					_aspectRatio: '16:9',
					_format: '1080i50',
					id: 'input1',
					name: 'Input 1',
					type: VideoIOType.RTMP
				}
			],
			packageName: 'test-file',
			requirePath: 'node_modules/anser/dist/index.js',
			targetVersion: 'v0.0',
			version: 'v1.0'
		}])
	})

	it ('Rejects missing config type', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile(strict<FunctionPackageFile>({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [
						{
							id: 'some-config',
							name: 'Some config'
						}
					],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0',
					version: 'v1.0'
				}}
			]
		}), 'node_modules/anser', 'test-file')).toEqual([{
			author: 'Tom Lee',
			config: [],
			inputs: [],
			mainFile: 'dist/index.js',
			name: 'test-function',
			outputs: [
				{
					_aspectRatio: '16:9',
					_format: '1080i50',
					id: 'input1',
					name: 'Input 1',
					type: VideoIOType.RTMP
				}
			],
			packageName: 'test-file',
			requirePath: 'node_modules/anser/dist/index.js',
			targetVersion: 'v0.0',
			version: 'v1.0'
		}])
	})

	it ('Handles missing config', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile(strict<FunctionPackageFile>({
			anser: [
				{ description: {
					author: 'Tom Lee',
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0',
					version: 'v1.0'
				}}
			]
		}), 'node_modules/anser', 'test-file')).toEqual([{
			author: 'Tom Lee',
			config: [],
			inputs: [],
			mainFile: 'dist/index.js',
			name: 'test-function',
			outputs: [
				{
					_aspectRatio: '16:9',
					_format: '1080i50',
					id: 'input1',
					name: 'Input 1',
					type: VideoIOType.RTMP
				}
			],
			packageName: 'test-file',
			requirePath: 'node_modules/anser/dist/index.js',
			targetVersion: 'v0.0',
			version: 'v1.0'
		}])
	})

	it ('Rejects missing version number', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [
						{
							id: 'some-config',
							type: 'string'
						}
					],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v0.0'
				}}
			]
		}, 'node_modules/anser', 'test-file')).toEqual([])
	})

	it ('Rejects incompatible target version', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: [
				{ description: {
					author: 'Tom Lee',
					config: [],
					mainFile: 'dist/index.js',
					name: 'test-function',
					outputs: [
						{
							aspectRatio: '16:9',
							format: '1080i50',
							id: 'input1',
							name: 'Input 1',
							type: 'RTMP'
						}
					],
					targetVersion: 'v1.0',
					version: 'v1.0'
				}}
			]
		}, 'node_modules/anser', 'test-file')).toEqual([])
	})

	it ('Handles missing description', () => {
		const loader = new FunctionLoader('', 'v0.0', logger)
		expect((loader as any).parseFromFile({
			anser: [
				{ }
			]
		}, 'node_modules/anser', 'test-file')).toEqual([])
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
