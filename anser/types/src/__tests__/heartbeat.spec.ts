import { BodyIsHeartbeat, Heartbeat } from '../heartbeat'

describe('Body Check', () => {
	it('Accepts a valid interface', () => {
		const heartbeat: Heartbeat = {
			data: [],
			time: new Date()
		}
		expect(BodyIsHeartbeat(heartbeat)).toBe(true)
	})

	it('Rejects an invalid interface', () => {
		const heartbeat: any = {
			neverUseThisKey: '',
			time: new Date()
		}
		expect(BodyIsHeartbeat(heartbeat)).toBe(false)
	})
})
