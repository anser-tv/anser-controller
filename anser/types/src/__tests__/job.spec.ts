import { ConfigType, FunctionConfig, FunctionDescription } from '../function/description'
import { ConfigContraintType, FunctionRunConfig } from '../function/function'
import { VideoIO, VideoIOType } from '../function/video-io/video-io'
import { Job, JobTarget, TargetType } from '../job/job'
import { JobRunConfig } from '../job/job-run-config'
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

const jobConf: FunctionRunConfig = new Map()
jobConf.set('videoCodec', 'h264')

const jobInputs: Map<string, VideoIO> = new Map()
jobInputs.set(sampleInput.id, sampleInput)

const jobOutputs: Map<string, VideoIO> = new Map()
jobOutputs.set(sampleOutput.id, sampleOutput)

const jobRConfig = new JobRunConfig('', jobConf, jobInputs, jobOutputs)

describe('Job', () => {
	it('Never can run', () => {
		const job = new Job(
			strict<JobTarget>({ type: TargetType.WORKER, workerId: 'test-worker' }),
			jobRConfig
		)
		return job.CanRun().then((result) => expect(result).toBe(false))
	})

	it('Never runs', () => {
		const job = new Job(
			strict<JobTarget>({ type: TargetType.WORKER, workerId: 'test-worker' }),
			jobRConfig
		)
		return job.Run().then((result) => expect(result).toEqual(false))
	})

	it('Never can stop', () => {
		const job = new Job(
			strict<JobTarget>({ type: TargetType.WORKER, workerId: 'test-worker' }),
			jobRConfig
		)
		return job.Stop().then((result) => expect(result).toEqual(false))
	})
})
