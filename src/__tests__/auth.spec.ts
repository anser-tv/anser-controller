import { Auth } from '../auth/auth'

describe('auth', () => {
	it('Loads auth keys', () => {
		const auth = new Auth('src/__tests__/mocks/auth_keys.txt')
		expect((auth as any).authKeys).toEqual(['0123456789', 'Hello'])
	})

	it('Checks auth', () => {
		const auth = new Auth('src/__tests__/mocks/auth_keys.txt')
		expect(auth.IsAuthorised('0123456789')).toBeTruthy()
		expect(auth.IsAuthorised('NOT AUTHORISED')).toBeFalsy()
	})
})
