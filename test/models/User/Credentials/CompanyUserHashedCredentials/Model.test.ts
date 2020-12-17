import { CompanyUserHashedCredentials } from "$models/User/Credentials";
import { AttributeNotDefinedError } from "$models/Errors";
import { PasswordEncryptor } from "$libs/PasswordEncryptor";

describe("CompanyUserHashedCredentials", () => {
  const secretPassword = "somethingVerySecret123";
  const mandatoryAttributes = {
    password: PasswordEncryptor.encrypt(secretPassword)
  };

  it("creates a valid CompanyUserHashedCredentials", () => {
    const credentials = new CompanyUserHashedCredentials(mandatoryAttributes);
    expect(credentials).toEqual(mandatoryAttributes);
  });

  it("throws an error no password is provided", () => {
    const attributes = { password: undefined as any };
    expect(() => new CompanyUserHashedCredentials(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("password")
    );
  });

  describe("authenticate", () => {
    it("returns true if the password matches", async () => {
      const credentials = new CompanyUserHashedCredentials(mandatoryAttributes);
      const isValid = await credentials.authenticate(secretPassword);
      expect(isValid).toBe(true);
    });

    it("returns false if the password does not match", async () => {
      const credentials = new CompanyUserHashedCredentials(mandatoryAttributes);
      const isValid = await credentials.authenticate("InvalidPassword");
      expect(isValid).toBe(false);
    });
  });
});
