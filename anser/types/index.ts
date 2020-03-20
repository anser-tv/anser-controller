export * from './src/function/description'
export * from './src/function/function'
export * from './src/function/loader'
export * from './src/function/anser-manifest'
export * from './src/db'
export * from './src/job/job'
export * from './src/job/job-run-config'
export * from './src/heartbeat'
export * from './src/worker-commands/worker-commands'
export * from './src/logger/logger'
export * from './src/strict'
export * from './src/worker/worker'
export * from './src/function/video-io/video-io'
export * from './src/function/video-io/video-output'
export { ObjectId } from 'mongodb'

/**
 * Checks whether two versions of anser are compatible with each other.
 * @param functionAnserVersion
 */
export function VersionsAreCompatible (v1: string, v2: string): boolean {
	return v1.toUpperCase() === v2.toUpperCase()
}
