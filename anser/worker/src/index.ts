import { AnserWorker } from './anser-worker'
import { ConfigLoader } from './config'

const dev = process.env.DEV ? true : false

const loader = new ConfigLoader('config/config.json')
const worker = new AnserWorker(
	loader.config.id,
	loader.config.controller,
	loader.config.functionsDirectory,
	loader.config.authKey, dev
)
worker.Start()
