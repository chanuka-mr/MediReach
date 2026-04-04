module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
    '!**/__tests__/integration/**'
  ],
  testPathIgnorePatterns: [
    '/__tests__/integration/',
    '/__tests__/setup.js',
    '/node_modules/'
  ],
  collectCoverageFrom: [
    'Controllers/**/*.js',
    'Models/**/*.js',
    'Model/**/*.js',
    'Middleware/**/*.js',
    'Services/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000,
  verbose: true
};
