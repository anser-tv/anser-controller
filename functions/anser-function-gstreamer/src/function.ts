import {
	AnserFunction,
	ConfigConstraint,
	ConfigConstraintString,
	ConfigContraintType,
	FunctionDescription,
	FunctionRunConfig,
	JobStatus,
	strict
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
		public description: FunctionDescription,
		public config: FunctionRunConfig,
		public status: JobStatus = JobStatus.UNKNOWN,
		public logger?: winston.Logger
	) {
		super(description, config, status, logger)
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
	public Stop (): Promise<boolean> {
		if (this.pipeline) {
			this.pipeline.stop()
		}

		return Promise.resolve(true)
	}

	/**
	 * Validates the function.
	 */
	public Validate (): boolean {
		return !!this.config.get('pipeline')
	}
	protected validate (): boolean {
		throw new Error('Method not implemented.')
	}

	protected start (): Promise<boolean> {
		if (!this.pipeline && this.pipelineString) {
			this.pipeline = new gstreamer.Pipeline(this.pipelineString)
			this.pipeline.pollBus((msg: gstreamer.IBusMsg) => {
				switch(msg.type) {
					case 'error':
						this.logger?.error(msg)
						this.status = JobStatus.FAILED_TO_START
						this.pipeline?.stop()
						break
					case 'eos':
						this.logger?.info('End of stream')
						this.status = JobStatus.STOPPED
						this.pipeline?.stop()
						break
				}
			})
			this.pipeline.play()
		}

		return Promise.reject(`Pipeline is already running`)
	}

	protected canRun (): Promise<boolean> {
		return Promise.resolve(true)
	}
}
