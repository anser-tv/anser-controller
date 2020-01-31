import winston = require('winston')
import { logger as anserlog } from '../logger/logger'
import { FunctionDescription } from './description'
import { ValidateFunctionConfig } from './validate-config'

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
	DROPDOWN = 'DROPDOWN',
	BOOLEAN = 'BOOLEAN'
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
	/** List of accepted values. Takes precendence over all other constraints. */
	acceptedValues?: string[]
}

export interface ConfigContraintNumber extends ConfigConstraintBase {
	type: ConfigContraintType.NUMBER
	minValue?: number
	maxValue?: number
	/** If set, minValue will be replaced with 0 */
	mustBePositive?: boolean
	/** Takes precendence over minValue */
	nonZero?: boolean
	/** List of accepted values. Takes precendence over all other constraints. */
	acceptedValues?: number[]
}

export interface ConfigConstraintDropdown extends ConfigConstraintBase {
	type: ConfigContraintType.DROPDOWN,
	acceptedValues: Array<number|string>
}

export interface ConfigContraintBoolean extends ConfigConstraintBase {
	type: ConfigContraintType.BOOLEAN
}

export type ConfigConstraint =
	ConfigConstraintString |
	ConfigContraintNumber |
	ConfigConstraintDropdown |
	ConfigContraintBoolean

export interface ConstraintMap { [field: string]: ConfigConstraint }

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
	public Validate (): boolean {
		return ValidateFunctionConfig(this.config, this.GetAllConfigOptions()) && this.validate()
	}
	/** Gets the options and constraints for a particular config option. */
	public abstract GetConfigOptionsForField (field: string): ConfigConstraint
	/** Validates function config. */
	protected abstract validate (): boolean
	/** Function start implementation. */
	protected abstract start (): Promise<boolean>
	/** Checks on whether function can run. */
	protected abstract canRun (): Promise<boolean>
}
