import { AnserFunctionManifest, FunctionDescription } from 'anser-types'
import { AnserFunctionGStreamerBase } from './src/function'

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

const manifest = new AnserFunctionManifest()
manifest.RegisterFunction(descriptionFunctionGStreamerBasic, AnserFunctionGStreamerBase)

export default manifest
