export const Environment = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEVELOPMENT: "development",
  TEST_TRAVIS: "test_travis",
  TEST: "test",
  NODE_ENV: process.env.NODE_ENV || "development",
  databaseURL: () => process.env.DATABASE_URL,
  JWTSecret: () => process.env.JWT_SECRET,
  FiubaUsersApi: {
    url: () => process.env.FIUBA_USERS_API_URL as string
  },
  emailApi: {
    applicationID: () => process.env.EMAIL_API_APPLICATION_ID,
    password: () => process.env.EMAIL_API_PASSWORD,
    url: () => process.env.EMAIL_API_URL as string
  },
  isLocal() {
    return [this.DEVELOPMENT, this.TEST, this.TEST_TRAVIS].includes(this.NODE_ENV);
  },
  validate() {
    if (this.isLocal()) return;

    const mandatoryVariables = [
      { name: "Database URL", value: this.databaseURL() },
      { name: "JWT secret", value: this.JWTSecret() },
      { name: "Email API application ID", value: this.emailApi.applicationID() },
      { name: "Email API password", value: this.emailApi.password() },
      { name: "Email API url", value: this.emailApi.url() },
      { name: "Fiuba Users API url", value: this.FiubaUsersApi.url() }
    ];

    mandatoryVariables.map(({ name, value }) => {
      if (!value) throw new Error(`Missing environment variable: ${name}`);
    });
  }
};
