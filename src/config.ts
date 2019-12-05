import fs from 'fs'
export interface Config {
	authKeys: string[]
	functionsDirectory?: string
}

/**
 * Loads a controller config from a JSON file.
 */
export class ConfigLoader {
	public config: Config

	constructor (file: string) {
		const data = fs.readFileSync(file, { encoding: 'utf-8' })
		const conf = JSON.parse(data)
		if (this.isValidConfig(conf)) {
			conf.functionsDirectory = conf.functionsDirectory ? conf.functionsDirectory : 'functions'
			this.config = conf
		} else {
			throw Error(`Invalid config: ${file}`)
		}
	}

	private isValidConfig (config: any): boolean {
		const keys = Object.keys(config)
		return keys.indexOf('authKeys') !== -1
	}
}
