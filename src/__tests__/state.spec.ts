import { State } from '../app/state'

describe('state', () => {
	it ('Adds a heartbeat', () => {
		const state = new State()
		const heartbeat = { time: new Date() }
		state.AddHeartbeat('test-worker', heartbeat)
		expect((state as any)._workersRegistered).toEqual(['test-worker'])
		expect((state as any)._heartBeats).toEqual({ 'test-worker': [heartbeat]})
		expect((state as any)._lastHeartbeat['test-worker']).toEqual(heartbeat)
	})
})
