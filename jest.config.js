module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    "node_modules",
    "test",
    "config/Environment.ts"
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  watchPathIgnorePatterns: [
    "/node_modules/"
  ]
};
