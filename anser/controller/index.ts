import { App } from './src/app/app'
const config = process.env.config ?? 'config/config.json'
const app = new App(config)

// Close server when process exits.
process.on('exit', () => app.Close())
// Catches ctrl+c event
process.on('SIGINT', () => app.Close())
// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', () => app.Close())
process.on('SIGUSR2', () => app.Close())
