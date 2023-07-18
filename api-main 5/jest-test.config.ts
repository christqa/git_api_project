/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import dotenv from 'dotenv';

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.test');

dotenv.config();

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
      },
    ],
  },

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  setupFiles: ['<rootDir>/src/test/test.env.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/core/prisma/singleton.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/lib/*',
    '.controller.ts$',
    '.dto.ts$',
    'morgan.ts',
    'logger.ts',
    '<rootDir>/src/modules/index/*',
    '<rootDir>/src/repositories/*',
    '<rootDir>/src/test/*',
    '<rootDir>/src/routes.ts',
    '<rootDir>/.*.index.ts$',
    '<rootDir>/.*.error.ts$',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/build/*',
    '<rootDir>/src/test/api-test-cases/*',
  ],
  maxWorkers: '100%',
  testTimeout: 10000,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!./**/*.json', '!./src/templates/**/*.js'],
  coverageThreshold: {
    global: {
      branch: 90,
      funcs: 90,
    },
  },
};
