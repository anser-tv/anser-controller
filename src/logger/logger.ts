import { createLogger, format, transports } from 'winston'

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
