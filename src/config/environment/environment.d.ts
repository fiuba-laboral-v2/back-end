export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEVELOPMENT: string;
      use_env_variable: string;
      DATABASE_URL: string;
    }
  }
}
