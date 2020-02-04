import fs from 'fs'
import path from 'path'
import winston = require('winston')
import { logger as anserLogger } from '../logger/logger'
import { AnserManifest } from './anser-manifest'
import { FunctionDescriptionMap } from './description'

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
	main?: string
	anser?: {
		targetVersion?: string
	}
}

/**
 * Loads all functions available to a controller / worker.
 */
export class FunctionLoader {
	public loadedFunctions: FunctionDescriptionMap = { }
	private logger: winston.Logger
	private packageName: string
	constructor (
		/** Path to functions */
		public functionDirectory: string,
		/** Version of anser running */
		private anserVersion: string,
		logger?: winston.Logger,
		/** Don't load functions immediately */
		dontLoadOnStart?: boolean,
		/** Used to replace package.json for tests */
		packageName?: string
	) {
		/* istanbul ignore next */
		if (logger) {
			this.logger = logger
		} else {
			this.logger = anserLogger
		}

		/* istanbul ignore next */
		if (packageName) {
			this.packageName = packageName
		} else {
			this.packageName = 'package.json'
		}

		/* istanbul ignore next */
		if (!dontLoadOnStart) {
			this.ReloadFunctions()
		}
	}

	/**
	 * Reloads all functions from the system.
	 * Warning: Synchronous! (For now)
	 */
	public ReloadFunctions /* istanbul ignore next */ (): void {
		this.loadedFunctions = { }
		if (this.functionDirectory) {
			this.logger.info('Reloading functions')
			const functionPackagePath = path.join(this.functionDirectory, this.packageName)
			if (fs.existsSync(functionPackagePath)) {
				const dependencies = this.GetDependenciesFromPackageFile(functionPackagePath)

				if (!dependencies) {
					this.logger.info(`No functions found`)
					return
				}

				dependencies.forEach((dep) => {
					const functionPath = path.join(this.functionDirectory, 'node_modules', dep, this.packageName)
					if (!this.IsAnserPackage(functionPath)) return

					const funcs =  this.loadFunctionsFromFile(functionPath)

					if (funcs) this.loadedFunctions = { ...this.loadedFunctions, ...funcs }
				})
			} else {
				this.logger.error(`No ${this.packageName} found in directory ${this.functionDirectory}`)
			}
		}

		this.logger.info(`Loaded ${Object.keys(this.loadedFunctions).length} functions`)
	}

	/**
	 * Returns all loaded functions.
	 */
	public GetFunctions (): FunctionDescriptionMap {
		return this.loadedFunctions
	}

	/**
	 * Gets the keys of the dependencies field of a package.json file.
	 */
	public GetDependenciesFromPackageFile (packagePath: string): string[] | undefined {
		if (fs.existsSync(packagePath)) {
			const file: { dependencies?: { [key: string]: string }} = JSON.parse(fs.readFileSync(packagePath).toString('utf-8'))
			if (file.dependencies && Object.keys(file.dependencies).length) {
				return Object.keys(file.dependencies)
			}
		}
	}

	/**
	 * Returns true if a package.json is an anser function package.
	 * @param packagePath Path to package.json
	 */
	public IsAnserPackage (packagePath: string): boolean {
		if (fs.existsSync(packagePath)) {
			const file: FunctionPackageFile =
				JSON.parse(fs.readFileSync(packagePath).toString('utf-8'))

			if (this.validateFile(file)) {
				return true
			}
		}

		return false
	}

	private loadFunctionsFromFile /* istanbul ignore next */ (functionPath: string): FunctionDescriptionMap | undefined {
		/* istanbul ignore next */
		if (fs.existsSync(functionPath)) {
			const file: FunctionPackageFile = JSON.parse(fs.readFileSync(functionPath).toString('utf-8'))
			if (this.validateFile(file) && this.isCompatible(file.anser!.targetVersion!)) {
				return this.parseFromFile(file, functionPath)
			}
		}
	}

	private parseFromFile /* istanbul ignore next */
		(file: FunctionPackageFile, functionPath: string): FunctionDescriptionMap {

		/* istanbul ignore next */
		let descriptions: FunctionDescriptionMap = { }

		/* istanbul ignore next */
		if (file.main) {
			descriptions = this.getFunctionsFromManifest(`/${functionPath}/${file.main}`)
		}

		/* istanbul ignore next */
		return descriptions
	}

	private getFunctionsFromManifest /* istanbul ignore next */ (manifestPath: string): FunctionDescriptionMap {
		/* istanbul ignore next */
		const manifest = require(manifestPath) as AnserManifest
		/* istanbul ignore next */
		return manifest.GetFunctions()
	}

	private validateFile (file: FunctionPackageFile): boolean {
		return !!file.main && !!file.anser && !!file.anser.targetVersion
	}

	/**
	 * Checks whether a functions target anser version is compatible with this version of Anser.
	 * @param functionAnserVersion
	 */
	private isCompatible (functionAnserVersion: string): boolean {
		return functionAnserVersion.toUpperCase() === this.anserVersion.toUpperCase()
	}
}
