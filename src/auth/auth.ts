import { Config } from '../config'

/**
 * Checks whether a client is authenticated.
 */
export class Auth {

	/**
	 * Checks if a client is authorised.
	 * @param authKey Client auth key.
	 * @returns {true} if the client is authorised.
	 */
	public IsAuthorised (authKey: string, config: Config): boolean {
		return config.authKeys.indexOf(authKey) !== -1
	}
}
