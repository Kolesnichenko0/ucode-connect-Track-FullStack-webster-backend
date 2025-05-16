import type { Config } from 'jest';

const baseConfig: Config = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    rootDir: '.',
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1'
    },
    modulePaths: ['<rootDir>'],
    collectCoverageFrom: [
        "**/*.(t|j)s"
    ],
    coverageDirectory: "../coverage",
    globalTeardown: '<rootDir>/test/setup/global.teardown.ts',
};

export default baseConfig;
