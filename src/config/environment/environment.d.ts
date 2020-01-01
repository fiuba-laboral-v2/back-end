export {};

declare global {
  namespace NodeJS {
    /* tslint:disable:interface-name*/
    interface ProcessEnv {
      DEVELOPMENT: string;
      USE_ENV_VARIABLE: string;
      DATABASE_URL: string;
    }
  }
}
