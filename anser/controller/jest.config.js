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
	],
	testEnvironment: "node",
	preset: '@shelf/jest-mongodb'
}