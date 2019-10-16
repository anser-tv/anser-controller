import { BodyIsHeartBeat, IHeartBeat } from '../heartbeat'

describe('Body Check', () => {
	it('Accepts a valid interface', () => {
		const heartbeat: IHeartBeat = {
			time: new Date()
		}
		expect(BodyIsHeartBeat(heartbeat)).toBe(true)
	})

	it('Rejects an invalid interface', () => {
		const heartbeat: any = {
			neverUseThisKey: '',
			time: new Date()
		}
		expect(BodyIsHeartBeat(heartbeat)).toBe(false)
	})
})
