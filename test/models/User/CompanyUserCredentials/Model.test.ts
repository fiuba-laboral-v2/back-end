import { CompanyUserCredentials } from "$models/User/CompanyUserCredentials";
import { AttributeNotDefinedError } from "$models/Errors";
import {
  InvalidEmailError,
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";

describe("CompanyUserCredentials", () => {
  const mandatoryAttributes = {
    email: "email@fi.uba.ar",
    password: "somethingVerySecret123"
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new CompanyUserCredentials(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  it("creates a valid CompanyUserCredentials", () => {
    const fiubaUser = new CompanyUserCredentials(mandatoryAttributes);
    expect(fiubaUser.email).toEqual(mandatoryAttributes.email);
    expect(fiubaUser.password).not.toEqual(mandatoryAttributes.password);
  });

  it("throws an error no email is provided", () => {
    expectToThrowErrorOnMissingAttribute("email");
  });

  it("throws an error no password is provided", () => {
    expectToThrowErrorOnMissingAttribute("password");
  });

  it("throws an error the email has invalid format", async () => {
    const email = "invalidFormat";
    const attributes = { ...mandatoryAttributes, email };
    expect(() => new CompanyUserCredentials(attributes)).toThrowErrorWithMessage(
      InvalidEmailError,
      InvalidEmailError.buildMessage(email)
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

  describe("", () => {
    it("returns true if the password matches", async () => {
      const fiubaUser = new CompanyUserCredentials(mandatoryAttributes);
      const isValid = await fiubaUser.authenticate(mandatoryAttributes.password);
      expect(isValid).toBe(true);
    });

    it("returns false if the password does not match", async () => {
      const fiubaUser = new CompanyUserCredentials(mandatoryAttributes);
      const isValid = await fiubaUser.authenticate("InvalidPassword");
      expect(isValid).toBe(false);
    });
  });
});
