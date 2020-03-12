import { AnserFunctionGStreamerBase } from 'anser-function-gstreamer/src/function'
import { AnserManifest, FunctionDescription } from 'anser-types'

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

const manifest = new AnserManifest()
manifest.RegisterFunction(descriptionFunctionGStreamerBasic, AnserFunctionGStreamerBase)
export const GetFunctions = manifest.GetFunctions
