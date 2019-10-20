import { AnserWorker } from '../anser-worker'

describe('anser-worker', () => {
	it ('Starts', () => {
		const worker = new AnserWorker('dev-worker', '127.0.0.1:5001')
		worker.Start()
	})
})
