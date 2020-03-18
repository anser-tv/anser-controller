export enum VideoIOType {
	UNKNOWN,
	RTMP
}

export interface VideoIOJSON {
	name: string,
	id: string,
	type: VideoIOType,
	format: string,
	aspectRatio: string
}

/**
 * Represents an IO video stream.
 */
export class VideoIO implements VideoIOJSON {
	protected _format: string
	protected _aspectRatio: string

	constructor (
		public name: string,
		public id: string,
		public type: VideoIOType,
		format: string,
		aspectRatio: string
	) {
		this._format = 'any'
		this._aspectRatio = 'any'

		this.format = format
		this.aspectRatio = aspectRatio
	}

	get format (): string {
		return this._format
	}

	set format (newFormat: string) {
		this.setFormat(newFormat, true)
	}

	get aspectRatio (): string {
		return this._aspectRatio
	}

	set aspectRatio (newRatio: string) {
		this.setAspectRatio(newRatio, true)
	}

	protected setFormat (newFormat: string, allowAny: boolean): void {
		if (this.validFormat(newFormat, allowAny)) {
			this._format = newFormat.toLowerCase()
		} else {
			throw new Error(`Invalid format: ${newFormat}`)
		}
	}

	protected setAspectRatio (newRatio: string, allowAny: boolean): void {
		if (this.validAspectRatio(newRatio, allowAny)) {
			this._aspectRatio = newRatio.toLowerCase()
		} else {
			throw new Error(`Invalid aspect ratio: ${newRatio}`)
		}
	}

	private validFormat (newFormat: string, allowAny: boolean): boolean {
		if (!newFormat.length) {
			throw new Error(`No format specified`)
		}

		return !!newFormat.match(/^\d{3,4}[ip]\d{2,3}$/i) ||
			!!newFormat.match(/^[PAL|NTSC]$/i) ||
			(allowAny && !!newFormat.match(/^any$/i))
	}

	private validAspectRatio (newRatio: string, allowAny: boolean): boolean {
		if (!newRatio.length) {
			throw new Error(`No aspect ratio specified`)
		}

		return !!newRatio.match(/^\d+(?:\.\d+)?(?::\d+)?$/) || (allowAny && !!newRatio.match(/^any$/i))
	}
}
