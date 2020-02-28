export * from './src/function/description'
export * from './src/function/function'
export * from './src/function/loader'
export * from './src/function/anser-manifest'
export * from './src/job/job'
export * from './src/heartbeat'
export * from './src/heartbeat-commands/heartbeat-commands'
export * from './src/logger/logger'
export * from './src/strict'

/**
 * Checks whether a functions target anser version is compatible with this version of Anser.
 * @param functionAnserVersion
 */
export function VersionsAreCompatible (v1: string, v2: string): boolean {
	return v1.toUpperCase() === v2.toUpperCase()
}
