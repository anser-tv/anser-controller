import { App } from './app/app'
const AUTH_KEYS = process.env.auth_keys || 'config/auth_keys.txt'
const app = new App(AUTH_KEYS)

// Close server when process exits.
process.on('exit', () => app.Close())
// Catches ctrl+c event
process.on('SIGINT', () => app.Close())
// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', () => app.Close())
process.on('SIGUSR2', () => app.Close())
