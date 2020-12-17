import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { BadCredentialsError } from "$models/User";
import { AttributeNotDefinedError } from "$models/Errors";
import {
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";

describe("CompanyUserRawCredentials", () => {
  const mandatoryAttributes = {
    password: "somethingVerySecret123"
  };

  it("creates a valid CompanyUserRawCredentials", () => {
    expect(() => new CompanyUserRawCredentials(mandatoryAttributes)).not.toThrowError();
  });

  it("creates a CompanyUserRawCredentials with its password hashed", () => {
    const credentials = new CompanyUserRawCredentials(mandatoryAttributes);
    expect(credentials.password).not.toEqual(mandatoryAttributes.password);
  });

  it("throws an error no password is provided", () => {
    const attributes = { password: undefined as any };
    expect(() => new CompanyUserRawCredentials(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("password")
    );
  });

  it("throws an error if the password has no digits", async () => {
    const password = "somethingWithoutDigits";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new CompanyUserRawCredentials(attributes)).toThrowErrorWithMessage(
      PasswordWithoutDigitsError,
      "La contraseña debe contener numeros"
    );
  });

  it("throws an error if the password is invalid", async () => {
    const password = "an invalid password";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new CompanyUserRawCredentials(attributes)).toThrowErrorWithMessage(
      PasswordWithoutUppercaseError,
      "La contraseña debe contener letras mayúsculas"
    );
  });

  describe("authenticate", () => {
    it("does not throw an error if the password matches", async () => {
      const credentials = new CompanyUserRawCredentials(mandatoryAttributes);
      await expect(
        credentials.authenticate(mandatoryAttributes.password)
      ).resolves.not.toThrowError();
    });

    it("throws an error if the password does not match", async () => {
      const credentials = new CompanyUserRawCredentials(mandatoryAttributes);
      await expect(credentials.authenticate("InvalidPassword")).rejects.toThrowErrorWithMessage(
        BadCredentialsError,
        BadCredentialsError.buildMessage()
      );
    });
  });
});
