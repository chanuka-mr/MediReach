module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
  moduleFileExtensions: ['js', 'json', 'node'],
  verbose: true,
  transform: {}, // Disable transformation for root tests to avoid JSX issues from other folders
};
