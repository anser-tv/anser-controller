import fs from 'fs'
import path from 'path'
import winston = require('winston')
import { FunctionDescription, JobRunConfig, VersionsAreCompatible } from '../..'
import { logger as anserLogger } from '../logger/logger'
import { AnserFunctionManifest } from './anser-manifest'
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
	public loadedFunctions: FunctionDescriptionMap = new Map()
	public functionManifestRequirePath: Map<string, AnserFunctionManifest> = new Map()
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
		this.loadedFunctions = new Map()
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
					const functionPath = path.join(this.functionDirectory, 'node_modules', dep)
					this.logger.info(functionPath)
					if (!this.IsAnserPackage(path.join(process.cwd(), functionPath, this.packageName))) {
						this.logger.info(`Not a valid anser package`)
						return
					}

					const funcs =  this.loadFunctionsFromFile(functionPath)
					this.logger.info(JSON.stringify(funcs))

					if (funcs) {
						for (const [key, func] of funcs[Symbol.iterator]()) {
							this.loadedFunctions.set(key, func)
						}
					}
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
		this.logger.info(packagePath)
		if (fs.existsSync(packagePath)) {
			const file: FunctionPackageFile =
				JSON.parse(fs.readFileSync(packagePath).toString('utf-8'))

			if (this.validateFile(file)) {
				return true
			}
		}

		this.logger.info(`File does not exist ${packagePath}`)
		return false
	}

	/**
	 * Checks whether a job can run on this worker.
	 * @param job Job to run.
	 */
	public async CheckJobCanRun (job: JobRunConfig): Promise<boolean> { // TODO: Maybe return an object?
		const manifest = this.getFunctionManifest(job.functionId)

		if (!manifest) return false

		return await this.canJobRun(job, manifest)
	}

	/**
	 * Starts a job on this worker.
	 * @param job Job to start.
	 */
	public async StartJob (job: JobRunConfig): Promise<boolean> {
		const manifest = this.getFunctionManifest(job.functionId)

		if (!manifest) return false

		if (!(await this.canJobRun(job, manifest))) return false

		return false
	}

	private async canJobRun (
		job: JobRunConfig, manifest: AnserFunctionManifest
	): Promise<boolean> {
		let canRun = false

		try {
			canRun = await manifest.CanJobRun(job)
		} catch {
			this.logger.info(`Failed to call CanJobRun for function ${job.functionId}`)
		}

		return canRun
	}

	private getFunctionManifest (functionId: string): AnserFunctionManifest | undefined {
		const func = this.loadedFunctions.get(functionId)

		if (!func) return

		return this.functionManifestRequirePath.get(functionId)
	}

	private loadFunctionsFromFile /* istanbul ignore next */ (functionPath: string): FunctionDescriptionMap | undefined {
		/* istanbul ignore next */
		const packageFile = path.join(functionPath, this.packageName)
		if (fs.existsSync(packageFile)) {
			const file: FunctionPackageFile = JSON.parse(fs.readFileSync(packageFile).toString('utf-8'))
			if (this.validateFile(file) && this.isCompatible(file.anser!.targetVersion!)) {
				return this.parseFromFile(file, functionPath)
			}
		}
	}

	private parseFromFile /* istanbul ignore next */
		(file: FunctionPackageFile, functionPath: string): FunctionDescriptionMap {

		/* istanbul ignore next */
		let descriptions: FunctionDescriptionMap = new Map()

		/* istanbul ignore next */
		if (file.main) {
			const manifestFile = path.join(functionPath, file.main)

			try {
				descriptions = this.getFunctionsFromManifest(manifestFile)
			} catch {
				this.logger.info(`Failed to call getFunctionsFromManifest for function ${manifestFile}`)
			}
		}

		/* istanbul ignore next */
		return descriptions
	}

	private getFunctionsFromManifest /* istanbul ignore next */ (manifestPath: string): FunctionDescriptionMap {
		/* istanbul ignore next */
		this.logger.info(`Requiring ${path.join(process.cwd(), manifestPath)}`)
		const manifest = require(path.join(process.cwd(), manifestPath)) as AnserFunctionManifest | undefined

		if (!manifest) return new Map()

		this.logger.info(`Required manifest`)

		/* istanbul ignore next */
		const funcs = manifest.GetFunctions()

		for (const [key] of funcs[Symbol.iterator]()) {
			this.functionManifestRequirePath.set(key, manifest)
		}

		return funcs
	}

	private validateFile (file: FunctionPackageFile): boolean {
		return !!file.main && !!file.anser && !!file.anser.targetVersion
	}

	/**
	 * Checks whether a functions target anser version is compatible with this version of Anser.
	 * @param functionAnserVersion
	 */
	private isCompatible (functionAnserVersion: string): boolean {
		return VersionsAreCompatible(functionAnserVersion, this.anserVersion)
	}
}
