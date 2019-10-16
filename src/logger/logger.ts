import * as express from 'express'
import { createLogger, format, transports } from 'winston'
import winston from 'winston'

const logfile: transports.FileTransportOptions = {
	filename: 'log.log'
}

export const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.printf(
			(info: any) =>
				`${info.timestamp} ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : ' ')
		)
	),
	level: 'debug',
	transports: [new transports.Console(), new transports.File(logfile)]
})

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
