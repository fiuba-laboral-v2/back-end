module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
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
  ],
  testPathIgnorePatterns: [".d.ts", ".js"],
  setupFilesAfterEnv: ["./test/config/jest.setup.ts"],
  globalTeardown: "./test/config/globalTeardown.ts"
};
