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
	anser?: [
		{
			description?: {
				targetVersion?: string
				name?: string
				author?: string
				version?: string
				config?: ConfigPackageFile[]
				inputs?: ConfigPackageVideoIO[]
				outputs?: ConfigPackageVideoIO[],
				mainFile?: string
			}
		}
	]
}

/**
 * Loads all functions available to a controller / worker.
 */
export class FunctionLoader {
	public loadedFunctions: { [id: string]: FunctionDescription } = { } // id: PACKAGE_NAME:FUNCTION_NAME:AUTHOR:HASH
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
						const funcs = this.loadFunctionsFromFile(
							path.join(this.functionDirectory, 'node_modules', key, this.packageName), key
						)
						funcs?.forEach((f) => {
							this.loadedFunctions[`${key.toUpperCase().replace(/[ -]/g, '_')}:${f.name.toUpperCase().replace(/[ -]/g, '_')}:${f.author.toUpperCase().replace(/[ -]/g, '_')}:${crypto.createHash('md5').update(JSON.stringify(f)).digest('hex')}`] = f
						})
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

	private loadFunctionsFromFile (functionPath: string, fileName: string): FunctionDescription[] | undefined {
		if (fs.existsSync(functionPath)) {
			const file: FunctionPackageFile = JSON.parse(fs.readFileSync(functionPath).toString('utf-8'))
			if (this.validateFile(file)) {
				return this.parseFromFile(file, fileName)
			}
		}
	}

	private parseFromFile (file: FunctionPackageFile, fileName: string): FunctionDescription[] {
		const descriptions: FunctionDescription[] = []
		const packageName = fileName

		if (file.anser && file.anser.length) {
			file.anser.forEach((a) => {
				const name = a.description?.name?.toString() || ''
				const version = a.description?.version?.toString() || ''
				const targetVersion = a.description?.targetVersion?.toString() || ''
				const author = a.description?.author?.toString() || ''
				const mainFile = a.description?.mainFile?.toString() || ''
				const config: FunctionConfig[] = []
				let inputs: VideoIO[] = []
				let outputs: VideoIO[] = []

				a.description?.config?.forEach((conf) => {
					if (conf.type) {
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

				a.description?.inputs?.forEach((inp) => {
					inputs = this.parseVideoIO(inp)
				})

				a.description?.outputs?.forEach((out) => {
					outputs = this.parseVideoIO(out)
				})

				if (
					(inputs.length || outputs.length) &&
					author.length &&
					mainFile.length &&
					name.length &&
					targetVersion.length &&
					version.length && this.isCompatible(targetVersion)
				) {
					descriptions.push({
						author,
						config,
						inputs,
						mainFile,
						name,
						outputs,
						packageName,
						targetVersion,
						version
					})
				}
			})

		}

		return descriptions
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
		return !!file.anser
	}

	/**
	 * Checks whether a functions target anser version is compatible with this version of Anser.
	 * @param functionAnserVersion
	 */
	private isCompatible (functionAnserVersion: string): boolean {
		return functionAnserVersion.toUpperCase() === this.anserVersion.toUpperCase()
	}
}
