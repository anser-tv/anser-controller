export enum ConfigType {
	UNKNOWN,
	DROPDOWN,
	STRING,
	INTEGER,
	BOOLEAN
}

export enum VideoIOType {
	UNKNOWN,
	RTMP
}

export interface FunctionDescription {
	name: string
	author: string
	version: string
	targetVersion: string
	mainFile: string
	config: FunctionConfig[]
	inputs: VideoIO[]
	outputs: VideoIO[]
}

export interface FunctionConfig {
	name: string
	id: string
	type: ConfigType
}

/**
 * Represents an IO video stream.
 */
export class VideoIO {
	private _format: string
	private _aspectRatio: string

	constructor (
		public name: string,
		public id: string,
		public type: VideoIOType
	) {
		this._format = 'any'
		this._aspectRatio = 'any'
	}

	get format (): string {
		return this._format
	}

	set format (newFormat: string) {
		if (newFormat.match(/^\d{3,4}[ip]\d{2,3}$/) || newFormat.match(/^any$/i)) {
			this._format = newFormat.toLowerCase()
		} else {
			throw new Error(`Invalid format: ${newFormat}`)
		}
	}

	get aspectRatio (): string {
		return this._aspectRatio
	}

	set aspectRatio (newRatio: string) {
		if (newRatio.match(/^\d{1,2}:\d{1,2}$/) || newRatio.match(/^any$/i)) {
			this._aspectRatio = newRatio.toLowerCase()
		} else {
			throw new Error(`Invalid aspect ratio: ${newRatio}`)
		}
	}
}
