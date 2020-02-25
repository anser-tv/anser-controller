import { AnserManifest, FunctionDescription, FunctionDescriptionMap, IdFromFunction } from 'anser-types'

/**
 * Describes functions available.
 */
class Manifest extends AnserManifest {

	/**
	 * Returns supported functions.
	 */
	public GetFunctions (): FunctionDescriptionMap {
		const descriptionFunctionGStreamerBasic: FunctionDescription = {
			author: 'Tom Lee',
			config: [],
			inputs: [],
			main: '',
			name: 'GStreamerBasic',
			outputs: [],
			packageName: 'anser-function-gstreamer',
			targetVersion: '1.0',
			version: '1.0.0'
		}

		return {
			[IdFromFunction(descriptionFunctionGStreamerBasic)]: descriptionFunctionGStreamerBasic
		}
	}
}

const manifest = new Manifest()
export const GetFunctions = manifest.GetFunctions
