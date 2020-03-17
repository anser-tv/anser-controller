import crypto from 'crypto'
import { ConfigConstraint } from './function'
import { VideoIO } from './video-io/video-io'
import { VideoOutput } from './video-io/video-output'

export enum ConfigType {
	UNKNOWN = 'UNKNOWN',
	DROPDOWN = 'DROPDOWN',
	STRING = 'STRING',
	INTEGER = 'INTEGER',
	BOOLEAN = 'BOOLEAN'
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
	outputs: VideoOutput[]
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
