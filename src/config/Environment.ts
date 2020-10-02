export const Environment = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEVELOPMENT: "development",
  TEST_TRAVIS: "test_travis",
  TEST: "test",
  NODE_ENV: process.env.NODE_ENV || "development",
  databaseURL: () => process.env.DATABASE_URL,
  JWTSecret: () => process.env.JWT_SECRET,
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

    const allVariablesArePresent =
      this.databaseURL() &&
      this.JWTSecret() &&
      this.emailApi.applicationID() &&
      this.emailApi.password() &&
      this.emailApi.url();

    if (!allVariablesArePresent) throw new Error(`Missing configuration`);
  }
};
