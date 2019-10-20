export enum ConfigType {
	DROPDOWN,
	STRING,
	INTEGER,
	BOOLEAN
}

export enum VideoIOType {
	RTMP
}

export interface FunctionDescription {
	name: string
	author: string
	version: string
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

	constructor (
		public name: string,
		public id: string,
		public type: VideoIOType
	) {
		this._format = '1080p25'
	}

	get format (): string {
		return this._format
	}
	set format (newFormat: string) {
		if (newFormat.match(/^\d{3,4}[ip]\d{2,3}$/)) {
			this._format = newFormat
		} else {
			throw new Error(`Invalid format: ${newFormat}`)
		}
	}
}
