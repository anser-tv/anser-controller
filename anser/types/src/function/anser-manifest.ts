import { AnserFunction, JobStatus } from '../..'
import { JobRunConfig } from '../job/job-run-config'
import { FunctionDescription, FunctionDescriptionMap, IdFromFunction } from './description'
import { AnserFunctionParams } from './function'
import { logger } from '../logger/logger'

type Constructor<T> = new (
	description: AnserFunctionParams['description'],
	config: AnserFunctionParams['config'],
	status: AnserFunctionParams['status']
) => T

/**
 * Describes the functions available from a package.
 */
export class AnserFunctionManifest {

	private _functionMap: FunctionDescriptionMap = new Map()
	private _functionClasses: Map<string, Constructor<AnserFunction>> = new Map()
	private _runingJobs: Map<string, AnserFunction> = new Map()

	/**
	 * Returns all registered functions.
	 */
	public GetFunctions (): FunctionDescriptionMap {
		return this._functionMap
	}

	/**
	 * Returns true if a job can run on a worker.
	 * @param runConfig Config of the job.
	 */
	public async CanJobRun (runConfig: JobRunConfig): Promise<boolean> {
		const run = this.getAnserFunction(runConfig)

		if (!run) return false

		return await run.CanRun()
	}

	/**
	 * Starts a job, returns true if successful.
	 * @param runConfig Job to start.
	 */
	public async StartJob (jobId: string, runConfig: JobRunConfig): Promise<boolean> {
		const run = this.getAnserFunction(runConfig)

		if (!run) return false

		let started = false

		try {
			started = await run.Start()
		} catch (err) {
			logger.error(err)
		}

		if (started) {
			this._runingJobs.set(jobId, run)
		}

		return started
	}

	/**
	 * Stops a job, returns true if successful.
	 * @param jobId Job to stop.
	 */
	public async StopJob (jobId: string): Promise<boolean> {
		const job = this._runingJobs.get(jobId)

		if (!job) return false

		let stopped = false

		try {
			stopped = await job.Stop()
		} catch (err) {
			logger.error(err)
		}

		return stopped
	}

	/**
	 * Register a function with the manifest.
	 * @param desc Function to register.
	 */
	public RegisterFunction (desc: FunctionDescription, cls: Constructor<AnserFunction>): void {
		const id = IdFromFunction(desc)
		this._functionMap.set(id, desc)
		this._functionClasses.set(id, cls)
	}

	private getAnserFunction (runConfig: JobRunConfig): AnserFunction | undefined {
		const func = this._functionClasses.get(runConfig.functionId)

		if (!func) return

		const desc = this._functionMap.get(runConfig.functionId)

		if (!desc) return

		return new func(desc, runConfig.functionConfig, JobStatus.STARTING)
	}
}
