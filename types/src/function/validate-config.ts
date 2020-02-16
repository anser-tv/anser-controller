import { ConfigContraintType, ConstraintMap, FunctionRunConfig } from './function'

export function ValidateFunctionConfig (config: FunctionRunConfig, constraints: ConstraintMap): boolean {
	const keys = Object.keys(config)
	let i = 0
	while (i < keys.length) {
		const key = keys[i]
		const constraint = constraints[key]

		let confVal = config[key]

		switch(constraint.type) {
			case ConfigContraintType.STRING:
				if (typeof confVal !== 'string') return false

				confVal = confVal as string

				if (constraint.acceptedValues) {
					if (!constraint.acceptedValues.includes(confVal)) return false
				} else {
					if (constraint.maxLength) {
						if (confVal.length > constraint.maxLength) return false
					}

					if (constraint.minLength) {
						if (confVal.length < constraint.minLength) return false
					}
				}
				break
			case ConfigContraintType.NUMBER:
				if (typeof confVal !== 'number') return false

				confVal = confVal as number

				if (constraint.acceptedValues) {
					if (!constraint.acceptedValues.includes(confVal)) return false
				} else {
					if (constraint.maxValue) {
						if (confVal > constraint.maxValue) return false
					}

					if (constraint.minValue) {
						if (confVal < constraint.minValue) return false
					}

					if (constraint.mustBePositive) {
						if (confVal < 0) return false
					}

					if (constraint.nonZero) {
						if (confVal === 0) return false
					}
				}

				break
			case ConfigContraintType.BOOLEAN:
				if (typeof confVal !== 'boolean') return false
				break
			case ConfigContraintType.DROPDOWN:
				if (typeof confVal === 'boolean') return false

				confVal = confVal as number | string

				const index = constraint.acceptedValues.indexOf(confVal)

				if (typeof constraint.acceptedValues[index] !== typeof confVal) return false
				break
		}
		i++
	}
	return true
}
