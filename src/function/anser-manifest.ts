import { FunctionDescriptionMap } from './description'

/**
 * Describes the functions available from a package.
 */
export abstract class AnserManifest {
	/**
	 * This function should return a list of all functions available in this package.
	 * A class which inherits this class and implements this method must be the default export for the file
	 * 	named in the 'main' field of the package.json. IE if your package.json has `"main": "index.js"`, the
	 * 	index.js must contain a class which inherits from this one and reports all of the functions exported
	 * 	by your package.
	 */
	public abstract GetFunctions (): FunctionDescriptionMap
}
