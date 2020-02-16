import { SystemInfoData } from 'anser-types'
import { State, WorkerStatus } from '../app/state'

describe('state', () => {
	it ('Adds a heartbeat', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] }
		state.AddHeartbeat('test-worker', heartbeat)
		const result1 = (state as any)._workersRegistered
		const result2 = (state as any)._heartBeats
		const result3 = (state as any)._lastHeartbeat['test-worker']
		state.StopManager()
		expect(result1).toEqual(new Map([['test-worker', WorkerStatus.ONLINE]]))
		expect(result2).toEqual({ 'test-worker': [heartbeat]})
		expect(result3).toEqual(heartbeat)
	})
})

describe('RequestSystemInfo', () => {
	it ('Requests when systeminfo has not been logged', () => {
		const state = new State()
		const result = (state as any).requestSystemInfo('test-worker')
		state.StopManager()
		expect(result).toBe(true)
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
		const result = (state as any).requestSystemInfo('test-worker')
		dateNowSpy.mockRestore()
		state.StopManager()
		expect(result).toBe(false)
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
		const result = (state as any).requestSystemInfo('test-worker')
		dateNowSpy.mockRestore()
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Recognises valid system info data', () => {
		const state = new State()
		const systemInfoData: SystemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30,
			ram_used: 25
		}
		const result = (state as any).isValidSystemInfoData(systemInfoData)
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Recognises invalid system info data', () => {
		const state = new State()
		const systemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30
		}
		const result = (state as any).isValidSystemInfoData(systemInfoData)
		state.StopManager()
		expect(result).toBe(false)
	})

	it('Starts manager', () => {
		const state = new State()
		state.StartManager()
		const result = (state as any)._runManager
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Stops manager', () => {
		const state = new State()
		state.StartManager()
		state.StopManager()
		expect((state as any)._runManager).toBe(false)
	})

	it('Detects disconnected worker', () => {
		const state = new State();
		(state as any)._lastHeartbeat['dev-worker'] = {
			time: 0
		};
		(state as any)._workersRegistered.set('dev-worker', WorkerStatus.ONLINE)
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 61 * 1000);
		(state as any).manageState()
		const result = (state as any)._workersRegistered.get('dev-worker')
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result).toBe(WorkerStatus.OFFLINE)
	})

	it('Does not alert on connected worker', () => {
		const state = new State();
		(state as any)._lastHeartbeat['dev-worker'] = {
			time: 0
		};
		(state as any)._workersRegistered.set('dev-worker', WorkerStatus.ONLINE)
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1000);
		(state as any).manageState()
		const result = (state as any)._workersRegistered.get('dev-worker')
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result).toBe(WorkerStatus.ONLINE)
	})

	it('Does not alert on already disconnected worker', () => {
		const state = new State();
		(state as any)._lastHeartbeat['dev-worker'] = {
			time: 0
		};
		(state as any)._workersRegistered.set('dev-worker', WorkerStatus.OFFLINE)
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1000);
		(state as any).manageState()
		const result = (state as any)._workersRegistered.get('dev-worker')
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result).toBe(WorkerStatus.OFFLINE)
	})

	it('Sets new server to online', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] }
		state.AddHeartbeat('test-worker', heartbeat)
		const result = (state as any)._workersRegistered
		state.StopManager()
		expect(result).toEqual(new Map([['test-worker', WorkerStatus.ONLINE]]))
	})

	it('Sets reconnected server to online', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] };
		(state as any)._workersRegistered.set('test-worker', WorkerStatus.OFFLINE);
		(state as any)._heartBeats['test-worker'] = []
		state.AddHeartbeat('test-worker', heartbeat)
		const result = (state as any)._workersRegistered
		state.StopManager()
		expect(result).toEqual(new Map([['test-worker', WorkerStatus.ONLINE]]))
	})
})
