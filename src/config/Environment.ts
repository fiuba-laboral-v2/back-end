const variablesKeys = {
  NODE_ENV: "NODE_ENV",
  DATABASE_URL: "DATABASE_URL",
  JWT_SECRET: "JWT_SECRET",
  FIUBA_USERS_API_URL: "FIUBA_USERS_API_URL",
  EMAIL_API_APPLICATION_ID: "EMAIL_API_APPLICATION_ID",
  EMAIL_API_PASSWORD: "EMAIL_API_PASSWORD",
  EMAIL_API_URL: "EMAIL_API_URL"
};

export type Env = "production" | "staging" | "development" | "test";

export const Environment = {
  PRODUCTION: "production" as Env,
  STAGING: "staging" as Env,
  DEVELOPMENT: "development" as Env,
  TEST: "test" as Env,
  NODE_ENV: () => (process.env[variablesKeys.NODE_ENV] as Env) || Environment.DEVELOPMENT,
  databaseURL: () => process.env[variablesKeys.DATABASE_URL],
  JWTSecret: () => process.env[variablesKeys.JWT_SECRET],
  FiubaUsersApi: {
    url: () => process.env[variablesKeys.FIUBA_USERS_API_URL] as string
  },
  emailApi: {
    applicationID: () => process.env[variablesKeys.EMAIL_API_APPLICATION_ID],
    password: () => process.env[variablesKeys.EMAIL_API_PASSWORD],
    url: () => process.env[variablesKeys.EMAIL_API_URL] as string
  },
  isStaging() {
    return this.NODE_ENV() === this.STAGING;
  },
  isLocal() {
    return [this.DEVELOPMENT, this.TEST].includes(this.NODE_ENV());
  },
  validate() {
    if (this.isLocal()) return;

    const mandatoryVariables = [
      { name: variablesKeys.DATABASE_URL, value: this.databaseURL() },
      { name: variablesKeys.JWT_SECRET, value: this.JWTSecret() },
      { name: variablesKeys.EMAIL_API_APPLICATION_ID, value: this.emailApi.applicationID() },
      { name: variablesKeys.EMAIL_API_PASSWORD, value: this.emailApi.password() },
      { name: variablesKeys.EMAIL_API_URL, value: this.emailApi.url() },
      { name: variablesKeys.FIUBA_USERS_API_URL, value: this.FiubaUsersApi.url() }
    ];

    mandatoryVariables.map(({ name, value }) => {
      if (!value) throw new Error(`Missing environment variable: ${name}`);
    });
  }
};
