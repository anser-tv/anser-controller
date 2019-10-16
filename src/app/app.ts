import express from 'express'
import http from 'http'
import { Auth } from '../auth/auth'
import { logger, LogRequest, LogResponse } from '../logger/logger'

export const API_VERSION = 'v1.0'

const DEBUG = process.env.DEBUG || false
const PORT = process.env.PORT || 5000

/**
 * Handles all API requests.
 */
export class App {
	public app: express.Express
	public auth: Auth
	public server: http.Server
	constructor (authKeys: string) {
		this.auth = new Auth(authKeys)
		this.app = express()
		// Perform auth challenge against all routes except '/'
		this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			if (!req.url.match(/^\/$/)) {
				this.authenticationChallenge(req, res, next)
			} else {
				LogRequest(req, logger)
				next()
			}
		})
		// Register all routes
		this.setupBindings()
		this.server = this.app.listen(PORT, () => {
			logger.info(`App is running on http://localhost:${PORT}`)
		})
	}

	private isAuthenticated (req: express.Request): boolean {
		/* istanbul ignore next */
		if (DEBUG) {
			return true
		}

		const authKey = req.header('auth-key')

		if (authKey) {
			if (this.auth.IsAuthorised(authKey)) {
				return true
			}
		}

		return false
	}

	private denyAccess (res: express.Response): void {
		res.statusMessage = 'Access Denied'
		res.status(401).end()
		LogResponse ('Access Denied', logger)
	}

	private authenticationChallenge (req: express.Request, res: express.Response, next: express.NextFunction): void {
		LogRequest (req, logger)
		if (!this .isAuthenticated(req)) {
			logger.info(`Denied access to user ${req.ip}`)
			this.denyAccess(res)
		} else {
			logger.info(`User is authenticated ${req.ip}`)
			next()
		}
	}

	private setupBindings (): void {
		/**
		 * Default route, useful for checking the API is online.
		 */
		this.app.get(
			'/',
			(req: express.Request, res: express.Response, next: express.NextFunction) => {
				LogResponse(`Sending code 200`, logger)
				res.status(200).end()
			}
		)

		/**
		 * Used to check if a client is authenticated.
		 */
		this.app.get(
			`/api/${API_VERSION}/auth/check`,
			(req: express.Request, res: express.Response) => {
				res.status(200).end()
			}
		)

		/**
		 * Gets all workers.
		 */
		this.app.get(
			`/api/${API_VERSION}/workers`,
			(req: express.Request, res: express.Response) => {
				LogResponse('Not implemented', logger)
				res.statusMessage = 'Not implemented'
				res.status(501).end()
			}
		)

		/**
		 * Gets all workers of a given status.
		 */
		this.app.get(
			`/api/${API_VERSION}/workers/status/:status`,
			(req: express.Request, res: express.Response) => {
				LogResponse('Not implemented', logger)
				res.statusMessage = 'Not implemented'
				res.status(501).end()
			}
		)

		/**
		 * Gets all heartbeats for a given worker.
		 */
		this.app.get(
			`/api/${API_VERSION}/heartbeat/:workerId`,
			(req: express.Request, res: express.Response) => {
				LogResponse('Not implemented', logger)
				res.statusMessage = 'Not implemented'
				res.status(501).end()
			}
		)

		/**
		 * Adds a heartbeat to a given worker.
		 * If the worker doesn't exist, it is registered.
		 * The response to the request contains a list of data to be sent by the worker in the next heartbeat
		 * 	e.g. Capture devices available.
		 */
		this.app.post(
			`/api/${API_VERSION}/heartbeat/:workerId`,
			(req: express.Request, res: express.Response) => {
				LogResponse('Not implemented', logger)
				res.statusMessage = 'Not implemented'
				res.status(501).end()
			}
		)
	}
}
