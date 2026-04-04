module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/integration/diagnostic.integration.test.js',
    '**/__tests__/integration/**/*.corrected.integration.test.js',
    '**/__tests__/integration/inquiry.integration.test.js',
    '**/__tests__/integration/user-profile.integration.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Note: auth, orders, pharmacy test files are covered by other configs
  ],
  collectCoverageFrom: [
    'Controllers/**/*.js',
    'Models/**/*.js',
    'Model/**/*.js',
    'Middleware/**/*.js',
    'Services/**/*.js',
    'Routes/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
