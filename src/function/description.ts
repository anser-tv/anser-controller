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
	/** Friendly (human readable) name */
	name: string
	/** Name of the package this function comes from */
	packageName: string
	/** Function author */
	author: string
	/** Function author */
	version: string
	/** Targeted Anser version */
	targetVersion: string
	/** Main file of function, for require(mainFile) */
	mainFile: string
	/** Config options of the function */
	config: FunctionConfig[]
	/** Video inputs */
	inputs: VideoIO[]
	/** Video outputs */
	outputs: VideoIO[],
	/** Path to require when loading this function */
	requirePath: string
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
		if (!newFormat.length) {
			throw new Error(`No format specified`)
		}

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
		if (!newRatio.length) {
			throw new Error(`No aspect ratio specified`)
		}

		if (newRatio.match(/^\d{1,2}:\d{1,2}$/) || newRatio.match(/^any$/i)) {
			this._aspectRatio = newRatio.toLowerCase()
		} else {
			throw new Error(`Invalid aspect ratio: ${newRatio}`)
		}
	}
}
