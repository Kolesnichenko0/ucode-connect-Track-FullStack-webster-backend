import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
    ...baseConfig,
    displayName: 'unit',
    testMatch: ['<rootDir>/test/unit/**/*.spec.ts'], //TODO: и для windows пути ..\..\
    setupFilesAfterEnv: ['<rootDir>/test/setup/unit.setup.ts'],
    globalSetup: '<rootDir>/test/setup/unit.global.setup.ts',
    maxWorkers: 1,
};

export default config;
