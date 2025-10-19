/** @type {import('jest').Config} */
const config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	collectCoverageFrom: [
		"lib/**/*.ts",
		"server/**/*.ts",
		"!**/*.d.ts",
		"!**/node_modules/**",
		"!**/__tests__/**",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				tsconfig: {
					jsx: "react",
				},
			},
		],
	},
}

module.exports = config
