import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
    ...baseConfig,
    displayName: 'e2e',
    testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
    globalSetup: '<rootDir>/test/setup/e2e.global.setup.ts',
    // setupFilesAfterEnv: ['<rootDir>/test/e2e.setup.ts'],
    maxWorkers: 1,
};

export default config;
