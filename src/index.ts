import { App } from './app/app'
const AUTH_KEYS = process.env.auth_keys || 'config/auth_keys.txt'
const app = new App(AUTH_KEYS)
