export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEVELOPMENT: string;
      USE_ENV_VARIABLE: string;
      DATABASE_URL: string;
    }
  }
}
