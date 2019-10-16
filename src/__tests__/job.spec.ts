import { ConfigType, SampleFunction, VideoIOType } from '../function/description'
import { Job, TargetType } from '../job/job'

describe('Job', () => {
	it('Never can run', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		return job.CanRun().then((result) => expect(result).toBe(false))
	})

	it('Never runs', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		return job.Run().then((result) => expect(result).toEqual(false))
	})

	it('Never can stop', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		return job.Stop().then((result) => expect(result).toEqual(false))
	})

	it('Finds config by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		expect((job as any).getConfigById('videoCodec')).toEqual({
			id: 'videoCodec',
			name: 'Video Codec',
			type: ConfigType.STRING
		})
	})

	it('Finds input by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		expect((job as any).getInputById('input')).toEqual({
			id: 'input',
			name: 'Input',
			type: VideoIOType.RTMP
		})
	})

	it('Finds output by Id', () => {
		const job = new Job(
			TargetType.WORKER,
			'test-worker',
			SampleFunction.config,
			SampleFunction.inputs,SampleFunction.outputs
		)
		expect((job as any).getOutputById('output')).toEqual({
			id: 'output',
			name: 'Output',
			type: VideoIOType.RTMP
		})
	})
})
