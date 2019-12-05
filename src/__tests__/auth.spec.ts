import { Auth } from '../auth/auth'
import { ConfigLoader } from '../config'

describe('auth', () => {
	it('Checks auth', () => {
		const auth = new Auth()
		const config = new ConfigLoader('src/__tests__/__mocks__/config_a.json')
		expect(auth.IsAuthorised('0123456789', config.config)).toBeTruthy()
		expect(auth.IsAuthorised('NOT AUTHORISED', config.config)).toBeFalsy()
	})
})
