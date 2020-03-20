import {
	BodyIsHeartbeat,
	BodyIsJobRunConfig,
	Heartbeat,
	logger,
	VersionsAreCompatible,
	WorkerStatus,
	JobRunConfigFromJSON
} from 'anser-types'
import express from 'express'
import asyncHandler from 'express-async-handler'
import http from 'http'
import https from 'https'
import { Auth } from '../auth/auth'
import { Config, ConfigLoader } from '../config'
import { LogRequest, LogResponse } from '../logger/logger'
import { State } from './state'

export const ANSER_VERSION = '1.0.0'

/* istanbul ignore next */
const DEV = process.env.DEV ?? false
/* istanbul ignore next */
const PORT = process.env.PORT ?? 5000

/**
 * Handles all API requests.
 */
export class App {
	public app: express.Express
	public auth: Auth
	public server: http.Server
	public serverDevelop?: http.Server
	public state: State
	public config: Config

	constructor (configFile?: string, dbUrlOverride?: string, delayStart?: boolean) {
		/* istanbul ignore next */
		this.config = new ConfigLoader(configFile ?? 'configs').config
		this.auth = new Auth()
		this.state = new State({ ...this.config, dbUrl: dbUrlOverride ?? this.config.dbUrl }, delayStart)
		this.app = express()
		this.app.use(express.json())
		// Perform auth challenge against all routes except '/'
		this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			if (!req.url.match(/^\/$/)) {
				this.authenticationChallenge(req, res, next)
			} else {
				LogRequest(req, logger)
				next()
			}
		})
		this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			if (!req.url.match(/^\/$/)) {
				this.versionCheck(req, res, next)
			} else {
				LogRequest(req, logger)
				next()
			}
		})
		// Register all routes
		this.setupBindings()
		this.server = https.createServer(this.app)
		this.server.listen(PORT)
		logger.info(`App is running on https://127.0.0.1:${PORT}`)
		/* istanbul ignore next*/
		if (DEV) {
			this.serverDevelop = http.createServer(this.app)
			this.serverDevelop.listen((PORT as number) + 1)
			logger.warn(`App is serving over HTTP at http://127.0.0.1:${(PORT as number) + 1}. This is STRONGLY discouraged for deployment.`)
		}
		if (!delayStart) {
			this.state.Initialize()
			this.state.StartManager()
		}
	}
	/**
	 * Connects to DB and starts managing state.
	 */
	public async Start (manager?: boolean): Promise<void> {
		await this.state.Initialize()
		if (manager) this.state.StartManager()
	}

	/**
	 * Disconnects from DB and stops managing state.
	 */
	public async Stop (): Promise<void> {
		this.state.StopManager()
		await this.state.Destroy()
	}

	/**
	 * Closes the server.
	 */
	public Close (): void {
		/* istanbul ignore next */
		if (this.server.listening) {
			logger.info('Closing server')
			this.server.close(() => logger.info('Server closed'))
		}

		/* istanbul ignore next */
		if (this.serverDevelop && this.serverDevelop.listening) {
			logger.info('Closing develop server')
			this.serverDevelop.close(() => logger.info('Develop server closed'))
		}

		this.state.StopManager()
	}

	private isAuthenticated (req: express.Request): boolean {
		/* istanbul ignore next */
		if (DEV) {
			return true
		}

		const authKey = req.header('authKey')

		if (authKey) {
			if (this.auth.IsAuthorised(authKey, this.config)) {
				return true
			}
		}

		return false
	}

	private anserVersionIsCompatible (req: express.Request): boolean {
		const targetVersion = req.header('targetVersion')

		if (!targetVersion) {
			logger.info(`Anser version not specified`)
			return false
		}

		if (VersionsAreCompatible(targetVersion, ANSER_VERSION)) {
			return true
		} else {
			logger.info(`Incompatible Anser version "${targetVersion}"`)
			return false
		}
	}

	private denyAccess (res: express.Response): void {
		res.status(401).send('Access Denied')
		LogResponse ('Access Denied', logger)
	}

	private authenticationChallenge (req: express.Request, res: express.Response, next: express.NextFunction): void {
		LogRequest (req, logger)
		if (!this.isAuthenticated(req)) {
			logger.info(`Denied access to client ${req.ip}`)
			this.denyAccess(res)
		} else {
			logger.debug(`Client is authenticated ${req.ip}`)
			next()
		}
	}

	private versionCheck (req: express.Request, res: express.Response, next: express.NextFunction): void {
		LogRequest(req, logger)
		if (this.anserVersionIsCompatible(req)) {
			next()
		} else {
			res.status(400).send(`Incompatible Anser version, controller version is ${ANSER_VERSION}`)
		}
	}

	private sendBadRequest (res: express.Response, message: string): void {
		LogResponse(`400 Bad Request: ${message}`, logger)
		res.status(400).send(message)
	}

	private setupBindings (): void {
		/**
		 * Default route, useful for checking the API is online.
		 */
		this.app.get(
			'/',
			(_req: express.Request, res: express.Response, next: express.NextFunction) => {
				LogResponse(`Sending code 200`, logger)
				res.status(200).end()
			}
		)

		/**
		 * Used to check if a client is authenticated.
		 */
		this.app.get(
			`/anser/auth/check`,
			(_req: express.Request, res: express.Response) => {
				res.status(200).end()
			}
		)

		/**
		 * WORKER ENDPOINT
		 */

		/**
		 * Gets the IDs of all workers.
		 */
		this.app.get(
			`/anser/workers`,
			asyncHandler(async (_req: express.Request, res: express.Response) => {
				try {
					const workers = await this.state.GetAllWorkers()
					res.send(workers)
				} catch (err) {
					logger.error(err)
					res.status(500).end()
				}
			})
		)

		/**
		 * Gets the IDs of all workers of a given status.
		 */
		this.app.get(
			`/anser/workers/status/:status`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				if (req.params.status.toUpperCase() in WorkerStatus) {
					const status = WorkerStatus[req.params.status.toUpperCase() as keyof typeof WorkerStatus]
					try {
						const workers = await this.state.GetWorkersOfStatus(status)
						res.send(workers)
					} catch (err) {
						logger.error(err)
						res.status(500).end()
					}
				} else {
					res.status(400).send(`Unknown status: ${req.params.status}`)
				}
			})
		)

		/**
		 * Gets the status of a given worker.
		 */
		this.app.get(
			`/anser/workers/:workerId/status`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				try {
					const status = await this.state.GetWorkerStatus(req.params.workerId)
					res.send({ status })
				} catch (err) {
					logger.error(err)
					res.send(500).end()
				}
			})
		)

		/**
		 * HEARTBEAT ENDPOINTS
		 */

		/**
		 * Gets all heartbeats for a given worker.
		 */
		this.app.get(
			`/anser/heartbeats/:workerId`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				this.state.GetAllHearbeatsForWorker(req.params.workerId).then((resp) => {
					res.send(resp)
				}).catch((err) => {
					logger.error(err)
					res.status(500).end()
				})
			})
		)

		/**
		 * Adds a heartbeat to a given worker.
		 * If the worker doesn't exist, it is registered.
		 * The response to the request contains a list of data to be sent by the worker in the next heartbeat
		 * 	e.g. Capture devices available.
		 */
		this.app.post(
			`/anser/heartbeat/:workerId`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				const body = req.body
				if (!BodyIsHeartbeat(body)) {
					const heartbeatExample: Heartbeat = {
						data: [],
						time: Date.now()
					}
					this.sendBadRequest(res, `Heartbeat must be in the form: ${JSON.stringify(heartbeatExample)}`)
				} else {
					this.state.AddHeartbeat(req.params.workerId, body as Heartbeat).then((result) => {
						if (result.commands && result.commands.length) {
							logger.debug(`Sending commands: ${JSON.stringify(result)}`)
							res.send(result)
						} else {
							res.status(200).end()
						}
					}).catch((err) => {
						logger.error(err)
						res.status(500).end()
					})
				}
			})
		)

		/**
		 * Gets the IDs of all the functions compatible with this anser controller.
		 */
		this.app.get(
			`/anser/functions/anser`,
			(_req: express.Request, res: express.Response) => {
				res.send(this.state.GetFunctionsKnownToAnser())
			}
		)

		/**
		 * Gets all the functions available on a worker.
		 */
		this.app.get(
			`/anser/functions/:workerId`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				this.state.GetFunctionsForWorker(req.params.workerId).then((result) => {
					res.send(result)
				}).catch((error) => {
					logger.error(error)
					res.status(500).end()
				})
			})
		)

		this.app.post(
			`/anser/jobs/add/worker/:workerId`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				if (!BodyIsJobRunConfig(req.body)) {
					this.sendBadRequest(res, `Invalid function`)
				} else {
					try {
						const runConf = JobRunConfigFromJSON(req.body)
						const result = await this.state.AddJobToWorker(req.params.workerId, runConf)
						res.send(result)
					} catch (err) {
						logger.error(err)
						res.status(500).end()
					}
				}
			})
		)

		this.app.post(
			`/anser/jobs/stop/:jobId`,
			asyncHandler(async (req: express.Request, res: express.Response) => {
				try {
					const result = await this.state.StopJob(req.params.jobId)
					res.send(result)
				} catch (err) {
					logger.error(err)
					res.status(500).end()
				}
			})
		)
	}
}
