import { CompanyUserCredentials } from "$models/User/CompanyUserCredentials";
import { AttributeNotDefinedError } from "$models/Errors";
import {
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";

describe("CompanyUserCredentials", () => {
  const mandatoryAttributes = {
    password: "somethingVerySecret123"
  };

  it("creates a valid CompanyUserCredentials", () => {
    const credentials = new CompanyUserCredentials(mandatoryAttributes);
    expect(credentials.password).not.toEqual(mandatoryAttributes.password);
  });

  it("throws an error no password is provided", () => {
    const attributes = { password: undefined as any };
    expect(() => new CompanyUserCredentials(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("password")
    );
  });

  it("throws an error if the password has no digits", async () => {
    const password = "somethingWithoutDigits";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new CompanyUserCredentials(attributes)).toThrowErrorWithMessage(
      PasswordWithoutDigitsError,
      "La contraseña debe contener numeros"
    );
  });

  it("throws an error if the password is invalid", async () => {
    const password = "an invalid password";
    const attributes = { ...mandatoryAttributes, password };
    expect(() => new CompanyUserCredentials(attributes)).toThrowErrorWithMessage(
      PasswordWithoutUppercaseError,
      "La contraseña debe contener letras mayúsculas"
    );
  });

  describe("authenticate", () => {
    it("returns true if the password matches", async () => {
      const credentials = new CompanyUserCredentials(mandatoryAttributes);
      const isValid = await credentials.authenticate(mandatoryAttributes.password);
      expect(isValid).toBe(true);
    });

    it("returns false if the password does not match", async () => {
      const credentials = new CompanyUserCredentials(mandatoryAttributes);
      const isValid = await credentials.authenticate("InvalidPassword");
      expect(isValid).toBe(false);
    });
  });
});
