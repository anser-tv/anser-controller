/**
 * Checks whether a client is authenticated.
 */
export class Auth {
	private authKeys: string[] = []

	constructor (keypath: string) {
		this.loadAuthKeys(keypath)
	}

	/**
	 * Checks if a client is authorised.
	 * @param authKey Client auth key.
	 * @returns {true} if the client is authorised.
	 */
	public IsAuthorised (authKey: string): boolean {
		if (this.authKeys.indexOf(authKey) !== -1) {
			return true
		}
		return false
	}

	private loadAuthKeys (keypath: string): void {
		const fs = require('fs')
		const keys = fs.readFileSync(keypath, 'utf-8')
		this.authKeys = keys.split('\n')
	}
}
