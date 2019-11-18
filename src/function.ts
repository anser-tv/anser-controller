import { AnserFunction, FunctionConfig, FunctionStatus, VideoIO } from 'anser-types'
import * as gstreamer from 'gstreamer-superficial'
import winston = require('winston')

/**
 * Provides a base class for writing functions using GStreamer.
 */
export class AnserFunctionGStreamerBase extends AnserFunction {
	public pipeline?: gstreamer.Pipeline
	public pipelineString?: string

	constructor (
		public name: string,
		public author: string,
		public version: string,
		public mainFile: string,
		public config: FunctionConfig[],
		public inputs: VideoIO[],
		public outputs: VideoIO[],
		public status: FunctionStatus = FunctionStatus.NOTUSED,
		public logger?: winston.Logger
	) {
		super(name, author, version, mainFile, config, inputs, outputs, status, logger)
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
		let pipelineFound = false
		let pipelineValid = false
		this.config.forEach((conf) => {
			if (conf.id === 'pipeline') {
				pipelineFound = true
				if (conf.value) {
					pipelineValid = true
					this.pipelineString = conf.value
				}
			}
		})
		return pipelineFound && pipelineValid
	}

	protected start (): Promise<boolean> {
		if (!this.pipeline && this.pipelineString) {
			this.pipeline = new gstreamer.Pipeline(this.pipelineString)
			this.pipeline.pollBus((msg: gstreamer.IBusMsg) => {
				switch(msg.type) {
					case 'error':
						this.logger?.error(msg)
						this.status = FunctionStatus.ERROR
						this.pipeline?.stop()
						break
					case 'eos':
						this.logger?.info('End of stream')
						this.status = FunctionStatus.STOPPED
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
