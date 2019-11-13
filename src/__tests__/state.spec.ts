import { SystemInfoData } from 'anser-types'
import { State, WorkerStatus } from '../app/state'

describe('state', () => {
	it ('Adds a heartbeat', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] }
		state.AddHeartbeat('test-worker', heartbeat)
		expect((state as any)._workersRegistered).toEqual({ 'test-worker': WorkerStatus.ONLINE })
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

	it('Recognises valid system info data', () => {
		const state = new State()
		const systemInfoData: SystemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30,
			ram_used: 25
		}
		expect((state as any).isValidSystemInfoData(systemInfoData)).toBe(true)
	})

	it('Recognises invalid system info data', () => {
		const state = new State()
		const systemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30
		}
		expect((state as any).isValidSystemInfoData(systemInfoData)).toBe(false)
	})

	it('Starts manager', () => {
		const state = new State()
		state.StartManager()
		expect((state as any)._runManager).toBe(true)
		state.StopManager()
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
		(state as any)._workersRegistered['dev-worker'] = WorkerStatus.ONLINE
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 60 * 1000);
		(state as any).manageState()
		expect((state as any)._workersRegistered['dev-worker']).toBe(WorkerStatus.OFFLINE)
	})

	it('Does not alert on connected worker', () => {
		const state = new State();
		(state as any)._lastHeartbeat['dev-worker'] = {
			time: 0
		};
		(state as any)._workersRegistered['dev-worker'] = WorkerStatus.ONLINE
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1000);
		(state as any).manageState()
		expect((state as any)._workersRegistered['dev-worker']).toBe(WorkerStatus.ONLINE)
	})

	it('Does not alert on already disconnected worker', () => {
		const state = new State();
		(state as any)._lastHeartbeat['dev-worker'] = {
			time: 0
		};
		(state as any)._workersRegistered['dev-worker'] = WorkerStatus.OFFLINE
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1000);
		(state as any).manageState()
		expect((state as any)._workersRegistered['dev-worker']).toBe(WorkerStatus.OFFLINE)
	})

	it('Sets new server to online', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] }
		state.AddHeartbeat('test-worker', heartbeat)
		expect((state as any)._workersRegistered).toEqual({ 'test-worker': WorkerStatus.ONLINE })
	})

	it('Sets reconnected server to online', () => {
		const state = new State()
		const heartbeat = { time: new Date(), data: [] };
		(state as any)._workersRegistered['test-worker'] = WorkerStatus.OFFLINE;
		(state as any)._heartBeats['test-worker'] = []
		state.AddHeartbeat('test-worker', heartbeat)
		expect((state as any)._workersRegistered).toEqual({ 'test-worker': WorkerStatus.ONLINE })
	})
})
