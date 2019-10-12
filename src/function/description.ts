export enum ConfigType {
	DROPDOWN,
	STRING,
	INTEGER,
	BOOLEAN
}

export enum VideoIOType {
	RTMP
}

export interface IFunctionDescription {
	name: string
	author: string
	version: string
	mainFile: string
	config: IFunctionConfig[]
	inputs: IFunctionInput[]
	outputs: IFunctionOutput[]
}

export interface IFunctionConfig {
	name: string
	id: string
	type: ConfigType
}

export interface IFunctionInput {
	name: string
	id: string
	type: VideoIOType
}

export interface IFunctionOutput {
	name: string
	id: string
	type: VideoIOType
}

export const SampleFunction: IFunctionDescription = {
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
