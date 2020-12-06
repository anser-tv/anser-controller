import { HeartbeatResponse, ObjectId, stripId, SystemInfoData, WorkerCommandType } from 'anser-types'
import { AnserWorker } from '../anser-worker'

const MOCK_SYSTEM_INFO: SystemInfoData = {
	cpu_usage_percent: 50,
	disk_capacity: 1000,
	disk_usage: 900,
	ram_available: 2000,
	ram_used: 1500
}

function mockGetSystemInfo (): Promise<SystemInfoData> {
	return Promise.resolve(MOCK_SYSTEM_INFO)
}

describe('anser-worker', () => {
	it ('Starts', () => {
		const worker = new AnserWorker('dev-worker', '127.0.0.1:5001', '', '')
		worker.Start()
	})

	it('Resolves false with no commands', async () => {
		const worker = new AnserWorker('dev-worker', '127.0.0.1:5001', '', '');
		(worker as any).getSystemInfo = mockGetSystemInfo
		const commands: HeartbeatResponse = {
			commands: []
		}
		const result = await (worker as any).processHeartbeatResponse(commands)
		expect((worker as any)._nextHeartbeat.data)
		.toEqual([])
		expect(result).toBe(false)
	})

	it('Sends SystemInfo', async () => {
		const worker = new AnserWorker('dev-worker', '127.0.0.1:5001', '', '');
		(worker as any).getSystemInfo = mockGetSystemInfo
		const commands: HeartbeatResponse = {
			commands: [{ _id: new ObjectId('000000000000'), command: {
				type: WorkerCommandType.SendSystemInfo
			}, workerId: ''}]
		}
		let result = await (worker as any).processHeartbeatResponse(commands)
		expect((worker as any)._nextHeartbeat.data)
		.toEqual([
			{
				command: WorkerCommandType.SendSystemInfo,
				commandId: new ObjectId('000000000000'),
				data: {
					cpu_usage_percent: 50,
					disk_capacity: 1000,
					disk_usage: 900,
					ram_available: 2000,
					ram_used: 1500
				}
			}
		])
		expect(result).toBe(true);
		(worker as any)._nextHeartbeat = { time: new Date() }
		result = await (worker as any).processHeartbeatResponse(commands)
		expect((worker as any)._nextHeartbeat.data)
		.toEqual([
			{
				command: WorkerCommandType.SendSystemInfo,
				commandId: new ObjectId('000000000000'),
				data: {
					cpu_usage_percent: 50,
					disk_capacity: 1000,
					disk_usage: 900,
					ram_available: 2000,
					ram_used: 1500
				}
			}
		])
		expect(result).toBe(true)
	})
})
