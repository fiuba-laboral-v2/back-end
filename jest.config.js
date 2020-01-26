module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  coveragePathIgnorePatterns: [
      "node_modules",
      "test"
  ]
};
