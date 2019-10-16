import { BodyIsHeartbeat, IHeartbeat } from '../heartbeat'

describe('Body Check', () => {
	it('Accepts a valid interface', () => {
		const heartbeat: IHeartbeat = {
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
