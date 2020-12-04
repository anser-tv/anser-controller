import {
	AnserDatabase,
	DBCollections,
	FunctionDescription,
	FunctionDescriptionMap,
	Heartbeat,
	HeartbeatDataSystemInfo,
	strict,
	stripId,
	StrippedHeartbeatsDB,
	StrippedWorker,
	SystemInfoData,
	WorkerCommandType,
	WorkerStatus
} from 'anser-types'
import { State } from '../app/state'

let database: AnserDatabase
let state: State

beforeEach(async () => {
	if (database) await database.Disconnect()
	database = new AnserDatabase(process.env.MONGO_URL as string)
	await database.Connect()
	state = new State({ authKeys: ['hello'], functionsDirectory: '', dbUrl: process.env.MONGO_URL as string }, true)
	await state.Initialize()
})

afterEach(async () => {
	for (const key in database.collections) {
		if (database.collections[(key as keyof DBCollections)]) {
			const k = key as keyof DBCollections
			try {
				await database.collections[k].drop()
			} catch (_err) { /* no-op */ }
		}
	}
	await database.Disconnect()
})

describe('state', () => {
	it ('Adds a heartbeat', async () => {
		const heartbeat = { time: 0, data: [] }
		await state.AddHeartbeat('test-worker', heartbeat)
		state.StopManager()
		const workers = await database.collections.WORKER.find({ }).toArray()
		const heartbeats = await database.collections.WORKER_HEARTBEAT.find({ }).toArray()
		expect(stripId(workers)).toEqual(
			strict<StrippedWorker[]>([
				{ workerId: 'test-worker', status: WorkerStatus.ONLINE }
			])
		)
		expect(stripId(heartbeats)).toEqual(
			strict<StrippedHeartbeatsDB[]>([
				strict<StrippedHeartbeatsDB>({
					workerId: 'test-worker',
					time: 0,
					data: []
				})
			])
		)
	})
})

describe('RequestSystemInfo', () => {
	it ('Requests when systeminfo has not been logged', async () => {
		const result = await (state as any).requestSystemInfo('test-worker')
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Doesn\'t request systeminfo when systeminfo has been recently added', async () => {
		const data: SystemInfoData = {
			cpu_usage_percent: 10,
			disk_capacity: 30,
			disk_usage: 25,
			ram_available: 20,
			ram_used: 5
		}

		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		const heartbeat: Heartbeat = {
			time: 0,
			data: [
				strict<HeartbeatDataSystemInfo>({
					command: WorkerCommandType.SendSystemInfo,
					data
				})
			]
		}
		await state.AddHeartbeat('test-worker', heartbeat)
		const result = await (state as any).requestSystemInfo('test-worker')
		dateNowSpy.mockRestore()
		state.StopManager()
		expect(result).toBe(false)
	})

	it('Requests systeminfo when it\'s been 5 minutes since last recieved', async () => {
		const data: SystemInfoData = {
			cpu_usage_percent: 10,
			disk_capacity: 30,
			disk_usage: 25,
			ram_available: 20,
			ram_used: 5
		}
		const heartbeat: Heartbeat = {
			time: 0,
			data: [
				strict<HeartbeatDataSystemInfo>({
					command: WorkerCommandType.SendSystemInfo,
					data
				})
			]
		}
		let dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		await state.AddHeartbeat('test-worker', heartbeat)
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 60 * 1000)
		const result = await (state as any).requestSystemInfo('test-worker')
		dateNowSpy.mockRestore()
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Recognises valid system info data', () => {
		const systemInfoData: SystemInfoData = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30,
			ram_used: 25
		}
		const result = state.IsValidSystemInfoData(systemInfoData)
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Recognises invalid system info data', () => {
		const systemInfoData: Omit<SystemInfoData, 'ram_used'> = {
			cpu_usage_percent: 50,
			disk_capacity: 90,
			disk_usage: 40,
			ram_available: 30
		}
		const result = state.IsValidSystemInfoData(systemInfoData as any)
		state.StopManager()
		expect(result).toBe(false)
	})

	it('Starts manager', () => {
		state.StartManager()
		const result = (state as any)._runManager
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Stops manager', () => {
		state.StartManager()
		state.StopManager()
		expect((state as any)._runManager).toBe(false)
	})

	it('Detects disconnected worker', async () => {
		let dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		await database.collections.WORKER.insertOne({ workerId: 'test-worker', status: WorkerStatus.ONLINE })
		await database.collections.WORKER_HEARTBEAT.insertOne({ workerId: 'test-worker', time: 0, data: [] })
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 61 * 1000)
		await (state as any).manageState()
		const result = await database.collections.WORKER.findOne({ workerId: 'test-worker' })
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result && result.status).toBe(WorkerStatus.OFFLINE)
	})

	it('Does not alert on connected worker', async () => {
		const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		await database.collections.WORKER.insertOne({ workerId: 'test-worker', status: WorkerStatus.ONLINE })
		await database.collections.WORKER_HEARTBEAT.insertOne({ workerId: 'test-worker', time: 0, data: [] })
		await (state as any).manageState()
		const result = await database.collections.WORKER.findOne({ workerId: 'test-worker' })
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result && result.status).toBe(WorkerStatus.ONLINE)
	})

	it('Does not alert on already disconnected worker', async () => {
		let dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		await database.collections.WORKER.insertOne({ workerId: 'test-worker', status: WorkerStatus.OFFLINE })
		await database.collections.WORKER_HEARTBEAT.insertOne({ workerId: 'test-worker', time: 0, data: [] })
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 61 * 1000)
		await (state as any).manageState()
		const result = await database.collections.WORKER.findOne({ workerId: 'test-worker' })
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(result && result.status).toBe(WorkerStatus.OFFLINE)
	})

	it('Sets new server to online', async () => {
		const heartbeat: StrippedHeartbeatsDB = { workerId: 'test-worker', time: 0, data: [] }
		await state.AddHeartbeat('test-worker', heartbeat)
		const workers = await database.collections.WORKER.find({ }).toArray()
		state.StopManager()
		expect(stripId(workers)).toEqual(
			strict<StrippedWorker[]>([
				{ workerId: 'test-worker', status: WorkerStatus.ONLINE }
			])
		)
	})

	it('Sets reconnected server to online', async () => {
		let dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0)
		await database.collections.WORKER.insertOne({ workerId: 'test-worker', status: WorkerStatus.OFFLINE })
		await database.collections.WORKER_HEARTBEAT.insertOne({ workerId: 'test-worker', time: 0, data: [] })
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 5000)
		const heartbeat: StrippedHeartbeatsDB = { workerId: 'test-worker', time: 0, data: [] }
		await state.AddHeartbeat('test-worker', heartbeat)
		const workers = await database.collections.WORKER.find({ }).toArray()
		state.StopManager()
		dateNowSpy.mockRestore()
		expect(stripId(workers)).toEqual(
			strict<StrippedWorker[]>([
				{ workerId: 'test-worker', status: WorkerStatus.ONLINE }
			])
		)
	})

	it('Recognises valid system info data', () => {
		const systemInfoData: FunctionDescriptionMap = new Map()
		systemInfoData.set('somehash', {
			author: '',
			config: [],
			inputs: [],
			main: '',
			name: '',
			outputs: [],
			packageName: '',
			targetVersion: '',
			version: ''
		})
		const result = state.IsValidListFunctionsData(systemInfoData)
		state.StopManager()
		expect(result).toBe(true)
	})

	it('Recognises invalid system info data', () => {
		const systemInfoData: FunctionDescriptionMap = new Map()
		systemInfoData.set('somehash', strict<Omit<FunctionDescription, 'version'>>({
			author: '',
			config: [],
			inputs: [],
			main: '',
			name: '',
			outputs: [],
			packageName: '',
			targetVersion: ''
		}) as any)

		const result1 = state.IsValidListFunctionsData(null as any)
		const result2 = state.IsValidListFunctionsData('func' as any)
		const result3 = state.IsValidListFunctionsData(undefined as any)
		const result4 = state.IsValidListFunctionsData(systemInfoData)
		state.StopManager()
		expect(result1).toBe(false)
		expect(result2).toBe(false)
		expect(result3).toBe(false)
		expect(result4).toBe(false)
	})
})
