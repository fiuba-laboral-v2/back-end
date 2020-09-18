const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["node_modules", "test", "config/Environment.ts"],
  globals: {
    "ts-jest": {
      isolatedModules: true
    }
  },
  watchPathIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: [".d.ts", ".js"],
  setupFiles: ["core-js"],
  setupFilesAfterEnv: ["./test/config/jest.setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/"
  })
};
