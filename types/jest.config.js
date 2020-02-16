module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverage: true,
	collectCoverageFrom: [
		"**/*.ts",
		"!src/__tests__/**",
		"!src/server.ts",
		"!src/index.ts",
		"!src/function/anser-manifest.ts",
		"!src/function/function.ts",
		"!src/logger/logger.ts"
	],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
}