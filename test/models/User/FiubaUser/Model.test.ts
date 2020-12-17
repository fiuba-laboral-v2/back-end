import { FiubaUser } from "$models/User";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
import { DniGenerator } from "$generators/DNI";
import {
  InvalidEmailError,
  NameWithDigitsError,
  EmptyNameError
} from "validations-fiuba-laboral-v2";

describe("FiubaUser", () => {
  const mandatoryAttributes = {
    name: "name",
    surname: "surname",
    email: "email@fi.uba.ar",
    dni: DniGenerator.generate()
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  it("creates a valid FiubaUser", () => {
    const fiubaUser = new FiubaUser(mandatoryAttributes);
    expect(fiubaUser).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid notification with an uuid", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const fiubaUser = new FiubaUser(attributes);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("creates a valid notification with an undefined uuid", () => {
    const fiubaUser = new FiubaUser(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const fiubaUser = new FiubaUser(mandatoryAttributes);
    expect(fiubaUser.uuid).toBeUndefined();
    fiubaUser.setUuid(uuid);
    expect(fiubaUser.uuid).toEqual(uuid);
  });

  it("throws an error if an uuid with invalid format is set", async () => {
    const fiubaUser = new FiubaUser(mandatoryAttributes);
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

  it("throws an error no dni is provided", async () => {
    expectToThrowErrorOnMissingAttribute("dni");
  });

  it("throws an error the uuid has invalid format", async () => {
    const attributes = { ...mandatoryAttributes, uuid: "invalidFormat" };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error the name has digits", async () => {
    const attributes = { ...mandatoryAttributes, name: "name1234" };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the name is empty", async () => {
    const attributes = { ...mandatoryAttributes, name: "" };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the surname has digits", async () => {
    const attributes = { ...mandatoryAttributes, surname: "name1234" };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      NameWithDigitsError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error the surname is empty", async () => {
    const attributes = { ...mandatoryAttributes, surname: "" };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      EmptyNameError,
      EmptyNameError.buildMessage()
    );
  });

  it("throws an error the email has invalid format", async () => {
    const email = "invalidFormat";
    const attributes = { ...mandatoryAttributes, email };
    expect(() => new FiubaUser(attributes)).toThrowErrorWithMessage(
      InvalidEmailError,
      InvalidEmailError.buildMessage(email)
    );
  });
});
