import winston = require('winston')
import { logger as anserlog } from '../logger/logger'
import { FunctionConfig, FunctionDescription, VideoIO } from './description'

export enum FunctionStatus {
	NOTUSED = 'NOTUSED', // Created but no action has been run
	CHECKING = 'CHECKING', // Checking if can run
	RUNNING = 'RUNNING',
	STOPPED = 'STOPPED',
	ERROR = 'ERROR'
}

export enum ConfigContraintType {
	STRING = 'STRING',
	NUMBER = 'NUMBER',
	DROPDOWN = 'DROPDOWN'
}

export interface FunctionRunConfig { [key: string]: number | string | boolean }

export interface ConfigConstraintBase {
	type: ConfigContraintType
}

export interface ConfigConstraintString extends ConfigConstraintBase {
	type: ConfigContraintType.STRING
	/** Maximum number of characters. */
	maxLength?: number
	/** Minimum number of characters. */
	minLength?: number
	/** List of accepted values. */
	acceptedValues?: string[]
}

export interface ConfigContraintNumber extends ConfigConstraintBase {
	type: ConfigContraintType.NUMBER
	minValue?: number
	maxValue?: number
	/** If set, minValue will be replace with 0 */
	mustBePositive?: number
	/** Takes precendence over mustBePositive and minValue */
	nonZero?: number
}

export interface ConfigConstraintDropdown extends ConfigConstraintBase {
	type: ConfigContraintType.DROPDOWN,
	acceptedValues: Array<number|string>
}

export type ConfigConstraint = ConfigConstraintString | ConfigContraintNumber | ConfigConstraintDropdown
export interface ConstraintMap { [field: string]: ConfigConstraint}

/**
 * Abstract implementation of Anser functions.
 */
export abstract class AnserFunction {
	constructor (
		public description: FunctionDescription,
		public config: FunctionRunConfig,
		public status: FunctionStatus = FunctionStatus.NOTUSED,
		public logger?: winston.Logger
	) {
		if (!logger) {
			this.logger = anserlog
		}
	}

	/** Returns true if it is possible for this function to be run on a particular worker. */
	public async CanRun (): Promise<boolean> {
		if (this.Validate()) {
			return this.canRun()
		}

		return Promise.resolve(false)
	}
	/** Starts this function. */
	public async Start (): Promise<boolean> {
		if (this.Validate()) {
			return this.start()
		}

		return Promise.resolve(false)
	}
	/** Stops this function. */
	public abstract async Stop (): Promise<boolean>
	/** Restarts this function. */
	public async Restart (): Promise<boolean> {
		await this.Stop()
		const started = await this.Start()
		return Promise.resolve(started)
	}
	/** Gets all config options and constraints for a function. */
	public GetAllConfigOptions (): ConstraintMap {
		return this.description.config.map<ConstraintMap>((conf) => {
			return{ [conf.name]: this.GetConfigOptionsForField(conf.name)}
		}).reduce((prev, cur) => {
			return { ...prev, ...cur}
		}, { })
	}
	/** Validates function config. */
	public abstract Validate (): boolean
	/** Gets the options and constraints for a particular config option. */
	public abstract GetConfigOptionsForField (field: string): ConfigConstraint
	/** Function start implementation. */
	protected abstract start (): Promise<boolean>
	/** Checks on whether function can run. */
	protected abstract canRun (): Promise<boolean>
}
