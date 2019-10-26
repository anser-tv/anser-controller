import { SystemInfoData } from 'anser-types'
import { State } from '../app/state'

describe('state', () => {
	it ('Adds a heartbeat', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] }
		state.AddHeartbeat('test-worker', heartbeat)
		expect((state as any)._workersRegistered).toEqual(['test-worker'])
		expect((state as any)._heartBeats).toEqual({ 'test-worker': [heartbeat]})
		expect((state as any)._lastHeartbeat['test-worker']).toEqual(heartbeat)
	})
})

describe('RequestSystemInfo', () => {
	it ('Requests when systeminfo has not been logged', () => {
		const state = new State()
		expect((state as any).requestSystemInfo('test-worker')).toBe(true)
	})

	it('Doesn\'t request systeminfo when systeminfo has been recently added', () => {
		const state = new State()
		const data: SystemInfoData = {
			cpu_usage_percent: 10,
			disk_capacity: 30,
			disk_usage: 25,
			ram_available: 20,
			ram_used: 5
		}

		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0);
		(state as any)._systemInfo['test-worker'] = {
			data,
			lastReceived: { getTime: () => 0 }
		}
		expect((state as any).requestSystemInfo('test-worker')).toBe(false)
		dateNowSpy.mockRestore()
	})

	it('Requests systeminfo when it\'s been 5 minutes since last recieved', () => {
		const state = new State()
		const data: SystemInfoData = {
			cpu_usage_percent: 10,
			disk_capacity: 30,
			disk_usage: 25,
			ram_available: 20,
			ram_used: 5
		};
		(state as any)._systemInfo['test-worker'] = {
			data,
			lastReceived: { getTime: () => 0 }
		}
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 60 * 1000)
		expect((state as any).requestSystemInfo('test-worker')).toBe(true)
		dateNowSpy.mockRestore()
	})
})
