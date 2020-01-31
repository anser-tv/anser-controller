import { FunctionConfig, VideoIO } from '../function/description'

export enum TargetType {
	WORKER = 'WORKER',
	GROUP = 'GROUP'
}

/**
 * Stores the state of a Job, is an instace of a function.
 */
export class Job {
	constructor (
		public targetType: TargetType,
		public target: string,
		public config: FunctionConfig[],
		public inputs: VideoIO[],
		public outputs: VideoIO[]
	) { }

	/**
	 * Checks if this job can be run.
	 * @returns {true} If the job can be run.
	 */
	public CanRun (): Promise<boolean> {
		return Promise.resolve(false)
	}

	/**
	 * Runs this job.
	 * @returns {true} If the job started successfully.
	 */
	public Run (): Promise<boolean> {
		return Promise.resolve(false)
	}

	/**
	 * Stops this job.
	 * @returns {true} If the job stopped successfully.
	 */
	public Stop (): Promise<boolean> {
		return Promise.resolve(false)
	}

	private getConfigById (id: string): FunctionConfig | undefined {
		return this.config.find((config) => config.id === id)
	}

	private getInputById (id: string): VideoIO | undefined {
		return this.inputs.find((input) => input.id === id)
	}

	private getOutputById (id: string): VideoIO | undefined {
		return this.outputs.find((output) => output.id === id)
	}
}
