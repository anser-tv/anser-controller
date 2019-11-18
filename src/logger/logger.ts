import * as express from 'express'
import winston from 'winston'

/**
 * Logs a HTTP request.
 * @param req HTTP request.
 * @param log Logger.
 */
export function LogRequest (req: express.Request, log: winston.Logger): void {
	log.info(`${req.method} ${req.url}`)
	if (req.body) {
		log.info(`Body: ${JSON.stringify(req.body)}`)
	}
}

/**
 * Logs a HTTP response.
 * @param response Response message.
 * @param log Logger.
 */
export function LogResponse (response: any, log: winston.Logger): void {
	log.debug(`Sending response: ${JSON.stringify(response)}`)
}
