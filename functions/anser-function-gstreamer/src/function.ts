import {
	AnserFunction,
	ConfigConstraint,
	ConfigConstraintString,
	ConfigContraintType,
	FunctionDescription,
	FunctionRunConfig,
	JobStatus,
	strict,
	ReportStatus
} from 'anser-types'
import * as gstreamer from 'gstreamer-superficial'
import winston = require('winston')

export interface IAnserFunctionGStreamerBaseConfig {
	pipeline: string
}

/**
 * Provides a base class for writing functions using GStreamer.
 */
export class AnserFunctionGStreamerBase extends AnserFunction {
	public pipeline?: gstreamer.Pipeline
	public pipelineString?: string

	constructor (
		description: FunctionDescription,
		config: FunctionRunConfig,
		status: JobStatus = JobStatus.UNKNOWN,
		jobId: string,
		logger?: winston.Logger
	) {
		super(description, config, status, jobId, logger)

		this.pipelineString = config.get('pipeline')?.toString()
	}

	/**
	 * Gets the config options.
	 * @param field Field name.
	 */
	public GetConfigOptionsForField (field: string): ConfigConstraint | void {
		if (field.match(/pipeline/i)) {
			return strict<ConfigConstraintString>({
				type: ConfigContraintType.STRING
			})
		}
	}

	/**
	 * Stops the pipeline.
	 */
	public async Stop (): Promise<boolean> {
		if (this.pipeline) {
			this.pipeline.stop()
			delete this.pipeline
		}

		return true
	}

	/**
	 * Validates the function.
	 */
	protected validate (): boolean {
		return !!this.config.get('pipeline')
	}

	protected start (reportStatus: ReportStatus): Promise<boolean> {
		if (!this.pipeline && this.pipelineString) {
			this.pipeline = new gstreamer.Pipeline(this.pipelineString)
			this.pipeline.pollBus((msg: gstreamer.IBusMsg) => {
				switch(msg.type) {
					case 'error':
						this.logger?.error(msg)
						this.status = JobStatus.STOPPED
						this.pipeline?.stop()
						reportStatus(this.jobId, this.status, JSON.stringify(msg))
						break
					case 'eos':
						this.logger?.info('End of stream')
						this.status = JobStatus.STOPPED
						this.pipeline?.stop()
						break
				}
			})
			this.pipeline.play()
			return Promise.resolve(true)
		} else {
			return Promise.reject(`Pipeline is already running`)
		}
	}

	protected canRun (): Promise<boolean> {
		return Promise.resolve(true)
	}
}
