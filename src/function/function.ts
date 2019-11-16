import { FunctionConfig, FunctionDescription, VideoIO } from './description'

export enum FunctionStatus {
	NOTUSED = 'NOTUSED', // Created but no action has been run
	CHECKING = 'CHECKING', // Checking if can run
	RUNNING = 'RUNNING',
	STOPPED = 'STOPPED'
}

/**
 * Abstract implementation of Anser functions.
 */
export abstract class AnserFunction implements FunctionDescription {
	constructor (
		public name: string,
		public author: string,
		public version: string,
		public mainFile: string,
		public config: FunctionConfig[],
		public inputs: VideoIO[],
		public outputs: VideoIO[],
		public status: FunctionStatus = FunctionStatus.NOTUSED
	) {

	}

	/** Returns true if it is possible for this function to be run on a particular worker. */
	public abstract async CanRun (): Promise<boolean>
	/** Starts this function. */
	public abstract async Start (): Promise<boolean>
	/** Stops this function. */
	public abstract async Stop (): Promise<boolean>
	/** Restarts this function. */
	public async Restart (): Promise<boolean> {
		await this.Stop()
		await this.Start()
		return Promise.resolve(true)
	}
}
