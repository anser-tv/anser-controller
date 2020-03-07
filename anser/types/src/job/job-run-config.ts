import { FunctionRunConfig } from '../..'
import { VideoIO } from '../function/description'

/**
 * Represents a request to start a job.
 */
export class JobRunConfig {
	constructor (
		public functionId: string,
		public functionConfig: FunctionRunConfig,
		public inputs: Map<string, VideoIO>,
		public outputs: Map<string, VideoIO>
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
	public GetOutputById (id: string): VideoIO | undefined {
		return this.outputs.get(id)
	}
}
