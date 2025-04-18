module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./src/tests/setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    collectCoverage: true,
    coverageReporters: ['text', 'lcov']
  };