declare module 'gstreamer-superficial' {
	/** Creates a GStreamer pipeline. */
	export class Pipeline {
		constructor (pipeline: string);

		/** Plays the pipeline. */
		public play (): void
		/** Stops the pipeline. */
		public stop (): void
		/** Polls the bus for messages */
		public pollBus (callback: any): void
	}

	export interface IBusMsg {
		type: 'state-changed' | 'GST_STREAM_STATUS_TYPE_ENTER' | 'error' | 'GST_STREAM_STATUS_TYPE_CREATE' | 'GST_STREAM_STATUS_TYPE_LEAVE' | 'eos'
		name: string
		owner: string
		object: string
		'old-state'?: string
		'new-state'?: string
		'pending-state'?: string
	}
}
