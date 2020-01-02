export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      use_env_variable: string;
      DATABASE_URL: string;
    }
  }
  namespace Environment {
    const PRODUCTION = "production";
    const STAGING = "staging";
    const DEVELOPMENT = "development";
    const TEST_TRAVIS = "test_travis";
    const TEST = "test";
  }
}
