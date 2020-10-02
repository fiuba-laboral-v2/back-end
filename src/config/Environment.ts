const variableKeys = {
  NODE_ENV: "NODE_ENV",
  DATABASE_URL: "DATABASE_URL",
  JWT_SECRET: "JWT_SECRET",
  FIUBA_USERS_API_URL: "FIUBA_USERS_API_URL",
  EMAIL_API_APPLICATION_ID: "EMAIL_API_APPLICATION_ID",
  EMAIL_API_PASSWORD: "EMAIL_API_PASSWORD",
  EMAIL_API_URL: "EMAIL_API_URL"
};

export const Environment = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEVELOPMENT: "development",
  TEST_TRAVIS: "test_travis",
  TEST: "test",
  NODE_ENV: process.env[variableKeys.NODE_ENV] || "development",
  databaseURL: () => process.env[variableKeys.DATABASE_URL],
  JWTSecret: () => process.env[variableKeys.JWT_SECRET],
  FiubaUsersApi: {
    url: () => process.env[variableKeys.FIUBA_USERS_API_URL] as string
  },
  emailApi: {
    applicationID: () => process.env[variableKeys.EMAIL_API_APPLICATION_ID],
    password: () => process.env[variableKeys.EMAIL_API_PASSWORD],
    url: () => process.env[variableKeys.EMAIL_API_URL] as string
  },
  isLocal() {
    return [this.DEVELOPMENT, this.TEST, this.TEST_TRAVIS].includes(this.NODE_ENV);
  },
  validate() {
    if (this.isLocal()) return;

    const mandatoryVariables = [
      { name: variableKeys.DATABASE_URL, value: this.databaseURL() },
      { name: variableKeys.JWT_SECRET, value: this.JWTSecret() },
      { name: variableKeys.EMAIL_API_APPLICATION_ID, value: this.emailApi.applicationID() },
      { name: variableKeys.EMAIL_API_PASSWORD, value: this.emailApi.password() },
      { name: variableKeys.EMAIL_API_URL, value: this.emailApi.url() },
      { name: variableKeys.FIUBA_USERS_API_URL, value: this.FiubaUsersApi.url() }
    ];

    mandatoryVariables.map(({ name, value }) => {
      if (!value) throw new Error(`Missing environment variable: ${name}`);
    });
  }
};
