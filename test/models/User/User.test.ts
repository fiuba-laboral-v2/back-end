import { User } from "$models/User";
import {
  FiubaCredentials,
  CompanyUserRawCredentials,
  CompanyUserHashedCredentials
} from "$models/User/Credentials";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
import {
  NameWithDigitsError,
  EmptyNameError,
  InvalidEmailError
} from "validations-fiuba-laboral-v2";
import { DniGenerator } from "$generators/DNI";

describe("User", () => {
  const mandatoryAttributes = {
    name: "name",
    surname: "surname",
    email: "email@fi.uba.ar",
    credentials: new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" })
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  it("creates a valid User with CompanyUserRawCredentials", () => {
    const fiubaUser = new User(mandatoryAttributes);
    expect(fiubaUser).toEqual(mandatoryAttributes);
  });

  it("creates a valid User with CompanyUserHashedCredentials", () => {
    const hashedPassword = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
    const credentials = new CompanyUserHashedCredentials({ password: hashedPassword });
    const attributes = { ...mandatoryAttributes, credentials };
    const fiubaUser = new User(attributes);
    expect(fiubaUser).toEqual(attributes);
  });

  it("creates a valid User with FiubaCredentials", () => {
    const credentials = new FiubaCredentials(DniGenerator.generate());
    const attributes = { ...mandatoryAttributes, credentials };
    const fiubaUser = new User(attributes);
    expect(fiubaUser).toEqual(attributes);
  });

  it("creates a valid User with an uuid", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const fiubaUser = new User(attributes);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("creates a valid User with an undefined uuid", () => {
    const fiubaUser = new User(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const fiubaUser = new User(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
    fiubaUser.setUuid(uuid);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("throws an error if an uuid with invalid format is set", async () => {
    const fiubaUser = new User(mandatoryAttributes);
    expect(() => fiubaUser.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error no name is provided", async () => {
    expectToThrowErrorOnMissingAttribute("name");
  });

  it("throws an error no surname is provided", async () => {
    expectToThrowErrorOnMissingAttribute("surname");
  });

  it("throws an error no email is provided", async () => {
    expectToThrowErrorOnMissingAttribute("email");
  });

  it("throws an error no credentials is provided", async () => {
    expectToThrowErrorOnMissingAttribute("credentials");
  });

  it("throws an error the uuid has invalid format", async () => {
    const attributes = { ...mandatoryAttributes, uuid: "invalidFormat" };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error the name has digits", async () => {
    const attributes = { ...mandatoryAttributes, name: "name1234" };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the name is empty", async () => {
    const attributes = { ...mandatoryAttributes, name: "" };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the surname has digits", async () => {
    const attributes = { ...mandatoryAttributes, surname: "name1234" };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the surname is empty", async () => {
    const attributes = { ...mandatoryAttributes, surname: "" };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the email has invalid format", async () => {
    const email = "invalidFormat";
    const attributes = { ...mandatoryAttributes, email };
    expect(() => new User(attributes)).toThrowErrorWithMessage(
      InvalidEmailError,
      InvalidEmailError.buildMessage(email)
    );
  });
});
