import { AnserWorker } from './anser-worker'
import { ConfigLoader } from './config'

const loader = new ConfigLoader('config/config.json')
const worker = new AnserWorker(loader.config.id, loader.config.controller)
worker.Start()
