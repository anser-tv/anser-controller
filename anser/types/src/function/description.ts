import crypto from 'crypto'
import { ConfigConstraint } from './function'

export enum ConfigType {
	UNKNOWN = 'UNKNOWN',
	DROPDOWN = 'DROPDOWN',
	STRING = 'STRING',
	INTEGER = 'INTEGER',
	BOOLEAN = 'BOOLEAN'
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
	/** Main file of function, for require(main) */
	main: string
	/** Config options of the function */
	config: FunctionConfig[]
	/** Video inputs */
	inputs: VideoIO[]
	/** Video outputs */
	outputs: VideoIO[]
}

export interface FunctionConfig {
	name: string
	id: string
	type: ConfigType
	constraints: ConfigConstraint
}

/**
 * id: PACKAGE_NAME:FUNCTION_NAME:HASH
 */
export type FunctionDescriptionMap = Map<string, FunctionDescription>

export function IdFromFunction (fnc: FunctionDescription): string {
	const hash = crypto.createHash('md5').update(JSON.stringify(fnc)).digest('hex')
	return `${fnc.packageName}:${fnc.name}:${hash}`
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
		if (!newFormat.length) {
			throw new Error(`No format specified`)
		}

		if (newFormat.match(/^\d{3,4}[ip]\d{2,3}$/i) || newFormat.match(/^[PAL|NTSC]$/i) || newFormat.match(/^any$/i)) {
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

		if (newRatio.match(/^\d+(?:\.\d+)?(?::\d+)?$/) || newRatio.match(/^any$/i)) {
			this._aspectRatio = newRatio.toLowerCase()
		} else {
			throw new Error(`Invalid aspect ratio: ${newRatio}`)
		}
	}
}
