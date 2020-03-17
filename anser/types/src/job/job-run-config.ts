import { FunctionRunConfig, VideoIO, VideoOutput } from '../..'

export interface JobRunConfigAPI {
	functionId: string,
	functionConfig: {
		[id: string]: string | number | boolean
	},
	inputs: {
		[id: string]: VideoIO
	}
	outputs: {
		[id: string]: VideoOutput
	}
}

export function ParseRunConfigAPI (configApi: JobRunConfigAPI): JobRunConfig {
	const conf: FunctionRunConfig = new Map()
	const inputs: Map<string, VideoIO> = new Map()
	const outputs: Map<string, VideoOutput> = new Map()

	for (const [key, val] of Object.entries(configApi.functionConfig)) {
		conf.set(key, val)
	}
	for (const [key, val] of Object.entries(configApi.inputs)) {
		inputs.set(key, val)
	}
	for (const [key, val] of Object.entries(configApi.outputs)) {
		outputs.set(key, val)
	}

	return new JobRunConfig(
		configApi.functionId,
		conf,
		inputs,
		outputs
	)
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
