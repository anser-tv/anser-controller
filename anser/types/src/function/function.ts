import winston = require('winston')
import { JobStatus } from '../job/job'
import { logger as anserlog } from '../logger/logger'
import { FunctionDescription } from './description'
import { ValidateFunctionConfig } from './validate-config'

export enum ConfigContraintType {
	STRING = 'STRING',
	NUMBER = 'NUMBER',
	DROPDOWN = 'DROPDOWN',
	BOOLEAN = 'BOOLEAN'
}

export type FunctionRunConfig = Map<string, number | string | boolean>

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
	acceptedValues: (number|string)[]
}

export interface ConfigContraintBoolean extends ConfigConstraintBase {
	type: ConfigContraintType.BOOLEAN
}

export type ConfigConstraint =
	ConfigConstraintString |
	ConfigContraintNumber |
	ConfigConstraintDropdown |
	ConfigContraintBoolean

export type ConstraintMap = Map<string, ConfigConstraint>

export interface AnserFunctionParams {
	description: FunctionDescription,
	config: FunctionRunConfig,
	status: JobStatus,
	logger?: winston.Logger
}

/**
 * Abstract implementation of Anser functions.
 */
export abstract class AnserFunction implements AnserFunctionParams {
	constructor (
		public description: FunctionDescription,
		public config: FunctionRunConfig,
		public status: JobStatus = JobStatus.STARTING,
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
		const map: ConstraintMap = new Map()
		this.description.config.map((conf) => {
			map.set(conf.id, conf.constraints)
		})
		return map
	}
	/** Validates function config. */
	public Validate (): boolean {
		return ValidateFunctionConfig(this.config, this.GetAllConfigOptions()) && this.validate()
	}
	/** Gets the options and constraints for a particular config option. */
	public abstract GetConfigOptionsForField (field: string): ConfigConstraint | void
	/** Validates function config. */
	protected abstract validate (): boolean
	/** Function start implementation. */
	protected abstract start (): Promise<boolean>
	/** Checks on whether function can run. */
	protected abstract canRun (): Promise<boolean>
}
