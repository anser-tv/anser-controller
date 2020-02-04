import { ConfigType, FunctionConfig, FunctionDescription, VideoIO, VideoIOType } from '../function/description'
import { ConfigContraintType } from '../function/function'
import { Job, TargetType } from '../job/job'
import { strict } from '../strict'

const sampleInput = new VideoIO('Input', 'input', VideoIOType.RTMP, '1080i50', '16:9')
const sampleOutput = new VideoIO('Output', 'output', VideoIOType.RTMP, '1080i50', '16:9')

const SAMPLE_FUNCTION: FunctionDescription = {
	author: 'Tom Lee',
	config: [
		{
			id: 'videoCodec',
			name: 'Video Codec',
			type: ConfigType.STRING,
			constraints: {
				type: ConfigContraintType.STRING
			}
		}
	],
	inputs: [
		sampleInput
	],
	main: 'main.js',
	name: 'Sample Function',
	outputs: [
		sampleOutput
	],
	targetVersion: 'v0.0',
	version: '1.0.0',
	packageName: 'sample-function'
}

describe('Job', () => {
	it('Never can run', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		return job.CanRun().then((result) => expect(result).toBe(false))
	})

	it('Never runs', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		return job.Run().then((result) => expect(result).toEqual(false))
	})

	it('Never can stop', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		return job.Stop().then((result) => expect(result).toEqual(false))
	})

	it('Finds config by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		expect((job as any).getConfigById('videoCodec')).toEqual(
			strict<FunctionConfig>({
				id: 'videoCodec',
				name: 'Video Codec',
				type: ConfigType.STRING,
				constraints: {
					type: ConfigContraintType.STRING
				}
			})
		)
	})

	it('Finds input by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		const result = (job as any).getInputById('input')
		expect(result.format === '1080i50')
		expect(result.id === 'input')
		expect(result.name === 'Input')
		expect(result.type === VideoIOType.RTMP)
	})

	it('Finds output by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SAMPLE_FUNCTION.config,
			SAMPLE_FUNCTION.inputs,
			SAMPLE_FUNCTION.outputs
		)
		const result: VideoIO = (job as any).getOutputById('output')
		expect(result.format === '1080i50')
		expect(result.id === 'output')
		expect(result.name === 'Output')
		expect(result.type === VideoIOType.RTMP)
		expect(result.aspectRatio === '16:9')
	})
})
