import { Environment } from "$config";

describe("Environment", () => {
  const setMandatoryEnvironmentVariables = () => {
    jest.spyOn(Environment, "isLocal").mockImplementation(() => false);
    jest.spyOn(Environment, "databaseURL").mockImplementation(() => "someUrl");
    jest.spyOn(Environment, "JWTSecret").mockImplementation(() => "secret");
    jest.spyOn(Environment.emailApi, "applicationID").mockImplementation(() => "id");
    jest.spyOn(Environment.emailApi, "password").mockImplementation(() => "pass");
    jest.spyOn(Environment.emailApi, "url").mockImplementation(() => "url");
    jest.spyOn(Environment.FiubaUsersApi, "url").mockImplementation(() => "url");
  };

  describe("validate", () => {
    it("checks for the presence of all environment variables", async () => {
      setMandatoryEnvironmentVariables();
      expect(() => Environment.validate()).not.toThrowError();
    });

    it("throws an error if DATABASE_URL is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment, "databaseURL").mockImplementation(() => undefined);
      expect(() => Environment.validate()).toThrowError(
        "Missing environment variable: DATABASE_URL"
      );
    });

    it("throws an error if JWT_SECRET is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment, "JWTSecret").mockImplementation(() => undefined);
      expect(() => Environment.validate()).toThrowError("Missing environment variable: JWT_SECRET");
    });

    it("throws an error if JWT_SECRET is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment.emailApi, "applicationID").mockImplementation(() => undefined);
      expect(() => Environment.validate()).toThrowError(
        "Missing environment variable: EMAIL_API_APPLICATION_ID"
      );
    });

    it("throws an error if EMAIL_API_PASSWORD is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment.emailApi, "password").mockImplementation(() => undefined);
      expect(() => Environment.validate()).toThrowError(
        "Missing environment variable: EMAIL_API_PASSWORD"
      );
    });

    it("throws an error if EMAIL_API_URL is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment.emailApi, "url").mockImplementation(() => undefined as any);
      expect(() => Environment.validate()).toThrowError(
        "Missing environment variable: EMAIL_API_URL"
      );
    });

    it("throws an error if FIUBA_USERS_API_URL is not present", async () => {
      setMandatoryEnvironmentVariables();
      jest.spyOn(Environment.FiubaUsersApi, "url").mockImplementation(() => undefined as any);
      expect(() => Environment.validate()).toThrowError(
        "Missing environment variable: FIUBA_USERS_API_URL"
      );
    });
  });

  describe("isLocal", () => {
    it("returns true it the current NODE_ENV is development", async () => {
      jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => Environment.DEVELOPMENT);
      expect(Environment.isLocal()).toBe(true);
    });

    it("returns true it the current NODE_ENV is test", async () => {
      jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => Environment.TEST);
      expect(Environment.isLocal()).toBe(true);
    });

    it("returns false it the current NODE_ENV is staging", async () => {
      jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => Environment.STAGING);
      expect(Environment.isLocal()).toBe(false);
    });

    it("returns false it the current NODE_ENV is production", async () => {
      jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => Environment.PRODUCTION);
      expect(Environment.isLocal()).toBe(false);
    });
  });
});
