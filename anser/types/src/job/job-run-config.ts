import { FunctionRunConfig, VideoIO, VideoOutput } from '../..'
import { VideoIOJSON } from '../function/video-io/video-io'
import { VideoOutputJSON } from '../function/video-io/video-output'

export interface JobRunConfigJSON {
	functionId: string,
	inputs: [string, VideoIOJSON][],
	outputs: [string, VideoOutputJSON][],
	functionConfig: [string, number | string | boolean][]
}

export function JobRunConfigFromJSON (configApi: JobRunConfigJSON): JobRunConfig {
	const conf: FunctionRunConfig = new Map()
	const inputs: Map<string, VideoIO> = new Map()
	const outputs: Map<string, VideoOutput> = new Map()

	for (const [key, val] of Object.entries(new Map(configApi.functionConfig))) {
		conf.set(key, val)
	}
	for (const [key, val] of Object.entries(new Map(configApi.inputs))) {
		inputs.set(key, new VideoIO(val.name, val.id, val.type, val.format, val.aspectRatio))
	}
	for (const [key, val] of Object.entries(new Map(configApi.outputs))) {
		outputs.set(key, new VideoOutput(val.name, val.id, val.type, val.format, val.aspectRatio))
	}

	return new JobRunConfig(
		configApi.functionId,
		conf,
		inputs,
		outputs
	)
}

export function JobRunConfigToJSON (config: JobRunConfig):  JobRunConfigJSON {
	return {
			functionId: config.functionId,
			inputs: Array.from(config.inputs.entries()),
			outputs: Array.from(config.outputs.entries(), o => {
				const props = o[1]
				const ret: VideoOutputJSON = {
					id: props.id,
					format: props.format,
					aspectRatio: props.aspectRatio,
					name: props.name,
					type: props.type,
					output: true
				}
				return [o[0], ret]
			}),
			functionConfig: Array.from(config.functionConfig.entries())
	}
}

/**
 * Represents a request to start a job.
 */
export class JobRunConfig {
	constructor (
		public functionId: string,
		public functionConfig: FunctionRunConfig,
		public inputs: Map<string, VideoIO>,
		public outputs: Map<string, VideoOutput>
	) {

	}

	/**
	 * Gets a config value given its ID.
	 */
	public GetConfigById (id: string): number | string | boolean | undefined {
		return this.functionConfig.get(id)
	}

	/**
	 * Gets an input config from its ID.
	 */
	public GetInputById (id: string): VideoIO | undefined {
		return this.inputs.get(id)
	}

	/**
	 * Gets an output config from its ID.
	 */
	public GetOutputById (id: string): VideoOutput | undefined {
		return this.outputs.get(id)
	}
}
