import { IHeartBeat } from 'anser-types'

/**
 * Stores the state of the controller.
 */
export class State {
	public workersRegistered: string[]
	public heartBeats: IHeartBeat[]
	constructor () {
		this.workersRegistered = []
		this.heartBeats = []
	}
}
