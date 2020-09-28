export const Environment = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEVELOPMENT: "development",
  TEST_TRAVIS: "test_travis",
  TEST: "test",
  NODE_ENV: process.env.NODE_ENV || "development",
  databaseURL() {
    return process.env.DATABASE_URL;
  },
  JWTSecret() {
    return process.env.JWT_SECRET;
  },
  emailApiApplicationID() {
    return process.env.EMAIL_API_APPLICATION_ID;
  },
  emailApiPassword() {
    return process.env.EMAIL_API_PASSWORD;
  },
  isLocal() {
    return [this.DEVELOPMENT, this.TEST, this.TEST_TRAVIS].includes(this.NODE_ENV);
  },
  validate() {
    if (this.isLocal()) return;

    const allVariablesArePresent =
      this.databaseURL() &&
      this.JWTSecret() &&
      this.emailApiApplicationID() &&
      this.emailApiPassword();

    if (!allVariablesArePresent) throw new Error(`Missing configuration`);
  }
};
