import { get } from 'request-promise'
import { logger } from './logger/logger'

const KEEPALIVE_INTERVAL = 1000

/**
 * Represents a worker.
 * @property id: Unique worker ID.
 * @property controller: Hostname of this workers' controller.
 */
export class AnserWorker {
	private _running: boolean = false
	private _connected: boolean = false
	constructor (
		public id: string,
		public controller: string
	) {

	}

	/**
	 * Starts this worker.
	 */
	public Start (): void {
		this._running = true
		this.keepAlive()
	}

	/* istanbul ignore next */
	private keepAlive (): void { // TODO: Send heartbeat
		get(`http://${this.controller}`).then(() => {
			if (!this._connected) {
				logger.info(`Connected to controller`)
			}
			this._connected = true
		}).catch(() => {
			if (this._connected) {
				logger.info(`Disconnected from controller!`)
			}
			this._connected = false
		})

		if (this._running) {
			setTimeout(() => { this.keepAlive() }, KEEPALIVE_INTERVAL)
		}
	}
}
