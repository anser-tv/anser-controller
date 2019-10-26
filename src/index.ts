import { AnserWorker } from './anser-worker'
import { ConfigLoader } from './config'

const dev = process.env.DEV ? true : false

const loader = new ConfigLoader('config/config.json')
const worker = new AnserWorker(loader.config.id, loader.config.controller, dev)
worker.Start()
