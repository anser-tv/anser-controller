import { ConfigContraintType, ConstraintMap, FunctionRunConfig } from '../function/function'
import { ValidateFunctionConfig } from '../function/validate-config'

describe('Validate Config', () => {

	/** Tests for strings */

	it ('Accepts all strings within accepted values', () => {
		const testValues = ['apple', 'banana', 'carrot']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				acceptedValues: testValues
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts strings longer than min length', () => {
		const testValues = ['apple', 'banana', 'carrot']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 4
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts strings of min length', () => {
		const testValues = ['one', 'two']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts strings shorter than max length', () => {
		const testValues = ['apple', 'banana', 'carrot']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				maxLength: 10
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts strings of max length', () => {
		const testValues = ['four', 'five']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				maxLength: 4
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts strings within length range', () => {
		const testValues = ['three', 'four', 'five', '0123456789']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 3,
				maxLength: 10
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Rejects a string outside accepted value', () => {
		const testValues = ['apple', 'banana', 'carrot']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				acceptedValues: ['wood', 'stone', 'metal']
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects a string shorter than min length', () => {
		const testValues = ['a', 'b', '']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects a string longer than max length', () => {
		const testValues = ['three', 'four', 'five', '0123456789']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				maxLength: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects strings outside length range', () => {
		const testValues = ['a', 'b', 'seventeen', '0123456789']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 3,
				maxLength: 5
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Gives precendence to acceptedValues', () => {
		/** String of correct length but not within accepted values */
		const testValues = ['three', 'four', 'five', '0123456789']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING,
				minLength: 3,
				maxLength: 10,
				acceptedValues: ['apple', 'banana', 'carrot']
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects non-strings', () => {
		const testValues = [1, 2, false]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.STRING
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	/** Tests for numbers */

	it ('Accepts all numbers within accepted values', () => {
		const testValues = [3, 4, 5, 6, 7, 8, 9, 10]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				acceptedValues: testValues
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts numbers above min value', () => {
		const testValues = [3, 4, 5, 100, 1000, 1000000]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				minValue: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts numbers below max value', () => {
		const testValues = [3, 4, 5, 0, -10, -100, -1000]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				maxValue: 10
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts min value', () => {
		const testValues = [3]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				minValue: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts max value', () => {
		const testValues = [3]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				maxValue: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts a positive value when mustBePositive is set', () => {
		const testValues = [3, 4, 5, 100, 1000, 1000000]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				mustBePositive: true
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Accepts a non-zero value when nonZero is set', () => {
		const testValues = [-3, -2, -1, 3, 4, 5, 100, 1000, 1000000]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				nonZero: true
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Rejects a number not in accepted values', () => {
		const testValues = [3, 5, 7, 9]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				acceptedValues: [2, 4, 6, 8]
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects numbers below min value', () => {
		const testValues = [2, 1, 0, -1]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				minValue: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects numbers above max value', () => {
		const testValues = [4, 5, 100, 1000, 1000000]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				maxValue: 3
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects a negative value when mustBePositive is set', () => {
		const testValues = [-2]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				minValue: -3,
				maxValue: 10,
				mustBePositive: true
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects a zero value when nonZero is set', () => {
		/** Include min/max where 0 would be accepted if nonZero wasn't set */
		const testValues = [0]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER,
				minValue: -3,
				maxValue: 10,
				nonZero: true
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects non-number values', () => {
		const testValues = ['0', false]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.NUMBER
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	/** Tests for dropdown */

	it ('Accepts values in acceptedValues', () => {
		const testValues = [3, '4', 5, '6', 7, '8']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.DROPDOWN,
				acceptedValues: testValues
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Rejects values not in acceptedValues', () => {
		const testValues = [3, '4', 5, '6', 7, '8']
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.DROPDOWN,
				acceptedValues: [0, '1', 2]
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	it ('Rejects boolean values', () => {
		const testValues = [true, false]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.DROPDOWN,
				acceptedValues: ['true', 'false']
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})

	/** Tests for booleans */
	it ('Accepts a boolean value', () => {
		const testValues = [true, false]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.BOOLEAN
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeTruthy()
		})
	})

	it ('Rejects non-boolean values', () => {
		const testValues = ['true', 'false', 1]
		const map: ConstraintMap = new Map()
		map.set(
			'test1',
			{
				type: ConfigContraintType.BOOLEAN
			}
		)

		testValues.forEach((val) => {
			const config: FunctionRunConfig = new Map()
			config.set('test1', val)
			expect(ValidateFunctionConfig(config, map)).toBeFalsy()
		})
	})
})
