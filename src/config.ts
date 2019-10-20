import fs from 'fs'
export interface Config {
	id: string,
	controller: string
}

/**
 * Loads a worker config from a JSON file.
 */
export class ConfigLoader {
	public config: Config

	constructor (file: string) {
		const data = fs.readFileSync(file, { encoding: 'utf-8' })
		const conf = JSON.parse(data)
		if (this.isValidConfig(conf)) {
			conf.controller = conf.controller.replace(/^https?:\/\//, '')
			this.config = conf
		} else {
			throw Error(`Invalid config: ${file}`)
		}
	}

	private isValidConfig (config: any): boolean {
		const template: Config = {
			controller: '',
			id: ''
		}
		return Object.keys(config).sort().toString() === Object.keys(template).sort().toString()
	}
}
