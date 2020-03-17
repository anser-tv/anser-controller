import { VideoIO, VideoIOType } from './video-io'

export class VideoOutput extends VideoIO {
	constructor (
		public name: string,
		public id: string,
		public type: VideoIOType,
		format: string,
		aspectRatio: string
	) {
		super(name, id, type, format, aspectRatio)
		this._format = 'any'
		this._aspectRatio = 'any'

		this.format = format
		this.aspectRatio = aspectRatio
	}

	set format (newFormat: string) {
		this.setFormat(newFormat, false)
	}

	set aspectRatio (newRatio: string) {
		this.setAspectRatio(newRatio, false)
	}
}
