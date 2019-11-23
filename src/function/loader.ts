import * as crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import winston = require('winston')
import { logger as anserLogger } from '../logger/logger'
import { ConfigType, FunctionConfig, FunctionDescription, VideoIO, VideoIOType } from './description'

export interface ConfigPackageFile {
	name?: string,
	id?: string,
	type?: string
}

export interface ConfigPackageVideoIO {
	name?: string,
	id?: string,
	type?: string,
	format?: string,
	aspectRatio?: string
}

export interface FunctionPackageFile {
	name?: string
	version?: string
	mainFile?: string
	anser?: {
		targetVersion?: string
		description?: {
			name?: string
			author?: string
			version?: string
			config?: ConfigPackageFile[]
			inputs?: ConfigPackageVideoIO[]
			outputs?: ConfigPackageVideoIO[]
		}
	}
}

/**
 * Loads all functions available to a controller / worker.
 */
export class FunctionLoader {
	public loadedFunctions: { [id: string]: FunctionDescription } = { } // id: FUNCTION_NAME:AUTHOR:HASH
	private logger: winston.Logger
	private packageName: string
	constructor (
		/** Path to functions */
		public functionDirectory: string,
		/** Version of anser running */
		private anserVersion: string,
		logger?: winston.Logger,
		/** Used to replace package.json for tests */
		packageName?: string
	) {
		if (logger) {
			this.logger = logger
		} else {
			this.logger = anserLogger
		}

		if (packageName) {
			this.packageName = packageName
		} else {
			this.packageName = 'package.json'
		}

		this.ReloadFunctions()
	}

	/**
	 * Reloads all functions from the system.
	 * Warning: Synchronous! (For now)
	 */
	public ReloadFunctions (): void {
		this.loadedFunctions = { }
		if (this.functionDirectory) {
			this.logger.info('Reloading functions')
			const functionPackagePath = path.join(this.functionDirectory, this.packageName)
			if (fs.existsSync(functionPackagePath)) {
				const file: { dependencies?: { [key: string]: string }} = JSON.parse(fs.readFileSync(functionPackagePath).toString('utf-8'))
				if (file.dependencies && Object.keys(file.dependencies).length) {
					Object.keys(file.dependencies).forEach((key) => {
						this.logger.info(`Loading function: ${key}`)
						const func = this.loadFunctionFromFile(path.join(this.functionDirectory, 'node_modules', key, this.packageName))
						if (func && this.isCompatible(func.targetVersion)) {
							this.loadedFunctions[`${func.name.toUpperCase().replace(/[ -]/g, '_')}:${func.author.toUpperCase().replace(/[ -]/g, '_')}:${crypto.createHash('md5').update(JSON.stringify(func)).digest('hex')}`] = func
						}
					})
				} else {
					this.logger.info(`No functions found`)
				}
			} else {
				this.logger.error(`No ${this.packageName} found in directory ${this.functionDirectory}`)
			}
		}
	}

	/**
	 * Returns all loaded functions.
	 */
	public GetFunctions (): { [id: string]: FunctionDescription } {
		return this.loadedFunctions
	}

	private loadFunctionFromFile (directory: string): FunctionDescription | undefined {
		if (fs.existsSync(directory)) {
			const file: FunctionPackageFile = JSON.parse(fs.readFileSync(directory).toString('utf-8'))
			if (this.validateFile(file)) {
				return this.parseFromFile(file)
			}
		}
	}

	private parseFromFile (file: FunctionPackageFile): FunctionDescription {
		const name = file.name?.toString() || ''
		const version = file.version?.toString() || ''
		const targetVersion = file.anser?.targetVersion?.toString() || ''
		const author = file.anser?.description?.author?.toString() || ''
		const mainFile = file.mainFile?.toString() || ''
		const config: FunctionConfig[] = []
		let inputs: VideoIO[] = []
		let outputs: VideoIO[] = []

		file.anser?.description?.config?.forEach((conf) => {
			if (conf.type?.length) {
				const newConf: FunctionConfig = {
					id: conf.id?.toString() || '',
					name: conf.name?.toString() || '',
					type: this.parseConfigType(conf.type)
				}
				if (newConf.id.length && newConf.name.length && newConf.type !== ConfigType.UNKNOWN) {
					config.push(newConf)
				}
			}
		})

		file.anser?.description?.inputs?.forEach((inp) => {
			inputs = this.parseVideoIO(inp)
		})

		file.anser?.description?.outputs?.forEach((out) => {
			outputs = this.parseVideoIO(out)
		})

		return {
			author,
			config,
			inputs,
			mainFile,
			name,
			outputs,
			targetVersion,
			version
		}
	}

	private parseVideoIO (io: ConfigPackageVideoIO): VideoIO[] {
		const retIO: VideoIO[] = []
		if (io.type?.length) {
			const newInp: VideoIO = new VideoIO(
				io.name?.toString() || '',
				io.id?.toString() || '',
				this.parseVideoIOType(io.type)
			)
			let valid = true
			try {
				newInp.format = io.format?.toString() || ''
				newInp.aspectRatio = io.aspectRatio?.toString() || ''
			} catch (e) {
				valid = false
				this.logger.error(e)
			}
			if (newInp.id.length && newInp.name.length && newInp.type !== VideoIOType.UNKNOWN && valid) {
				retIO.push(newInp)
			}
		}

		return retIO
	}

	private parseConfigType (type?: string): ConfigType {
		if (!type) {
			return ConfigType.UNKNOWN
		}

		switch(type.toUpperCase()) {
			case 'DROPDOWN':
				return ConfigType.DROPDOWN
			case 'STRING':
				return ConfigType.STRING
			case 'INTEGER':
				return ConfigType.INTEGER
			case 'BOOLEAN':
				return ConfigType.BOOLEAN
			default:
				return ConfigType.UNKNOWN
		}
	}

	private parseVideoIOType (type?: string): VideoIOType {
		if (!type) {
			return VideoIOType.UNKNOWN
		}

		switch(type.toUpperCase()) {
			case 'RTMP':
				return VideoIOType.RTMP
			default:
				return VideoIOType.UNKNOWN
		}

	}

	private validateFile (file: FunctionPackageFile): boolean {
		return !!file.name &&
			!!file.version &&
			!!file.anser &&
			!!file.anser.targetVersion &&
			!!file.anser.description &&
			!!file.anser.description.author &&
			!!file.anser.description.config &&
			!!file.anser.description.inputs &&
			!!file.mainFile &&
			!!file.anser.description.name &&
			!!file.anser.description.version
	}

	/**
	 * Checks whether a functions target anser version is compatible with this version of Anser.
	 * @param functionAnserVersion
	 */
	private isCompatible (functionAnserVersion: string): boolean {
		return functionAnserVersion.toUpperCase() === this.anserVersion.toUpperCase()
	}
}
