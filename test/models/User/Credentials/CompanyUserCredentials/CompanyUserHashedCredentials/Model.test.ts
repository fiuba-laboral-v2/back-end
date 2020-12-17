import { CompanyUserHashedCredentials } from "$models/User/Credentials";
import { BadCredentialsError } from "$models/User";
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

  it("creates a valid CompanyUserHashedCredentials with a hashed password", () => {
    const password = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
    const credentials = new CompanyUserHashedCredentials({ password });
    expect(credentials.password).toEqual(password);
  });

  it("throws an error no password is provided", () => {
    const attributes = { password: undefined as any };
    expect(() => new CompanyUserHashedCredentials(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("password")
    );
  });

  describe("authenticate", () => {
    it("does not throw an error if the password matches", async () => {
      const credentials = new CompanyUserHashedCredentials(mandatoryAttributes);
      await expect(credentials.authenticate(secretPassword)).resolves.not.toThrowError();
    });

    it("throws an error if the password does not match", async () => {
      const credentials = new CompanyUserHashedCredentials(mandatoryAttributes);
      await expect(credentials.authenticate("InvalidPassword")).rejects.toThrowErrorWithMessage(
        BadCredentialsError,
        BadCredentialsError.buildMessage()
      );
    });
  });
});
