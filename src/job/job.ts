import { IFunctionConfig, IFunctionInput, IFunctionOutput } from '../function/description'

/**
 * Stores the state of a Job, is an instace of a function.
 */
export class Job {
	constructor (public config: IFunctionConfig[], public inputs: IFunctionInput[], public outputs: IFunctionOutput[]) { }

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

	private getConfigById (id: string): IFunctionConfig | undefined {
		return this.config.find((config) => config.id === id)
	}

	private getInputById (id: string): IFunctionInput | undefined {
		return this.inputs.find((input) => input.id === id)
	}

	private getOutputById (id: string): IFunctionOutput | undefined {
		return this.outputs.find((output) => output.id === id)
	}
}
