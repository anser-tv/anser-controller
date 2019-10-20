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
	inputs: FunctionInput[]
	outputs: FunctionOutput[]
}

export interface FunctionConfig {
	name: string
	id: string
	type: ConfigType
}

export interface FunctionInput {
	name: string
	id: string
	type: VideoIOType
}

export interface FunctionOutput {
	name: string
	id: string
	type: VideoIOType
}
