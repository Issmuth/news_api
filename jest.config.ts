export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^../db$': '<rootDir>/src/db/index.ts',
  },
};