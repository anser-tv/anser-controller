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

export const SampleFunction: FunctionDescription = {
	author: 'Tom Lee',
	config: [
		{
			id: 'videoCodec',
			name: 'Video Codec',
			type: ConfigType.STRING
		}
	],
	mainFile: 'index.js',
	name: 'Transcode',
	version: '1.0.0',

	inputs: [
		{
			id: 'input',
			name: 'Input',
			type: VideoIOType.RTMP
		}
	],
	outputs: [
		{
			id: 'output',
			name: 'Output',
			type: VideoIOType.RTMP
		}
	]
}
