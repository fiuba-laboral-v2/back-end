import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { UserSequelizeModel } from "$models";
import { MissingDniError } from "$models/User/Errors";
import { InvalidEmailError, NameWithDigitsError } from "validations-fiuba-laboral-v2";
import { DniGenerator } from "$generators/DNI";
import { omit } from "lodash";

describe("UserSequelizeModel", () => {
  const userAttributes = {
    uuid: UUID.generate(),
    dni: DniGenerator.generate(),
    email: "asd@qwe.com",
    password: "somethingVerySecret123",
    name: "name",
    surname: "surname"
  };

  const expectToThrowErrorForMissingAttribute = async (attributeName: string) => {
    const attributes = omit(userAttributes, attributeName);
    const user = new UserSequelizeModel(attributes);
    await expect(user.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: UserSequelizeModel.${attributeName} cannot be null`
    );
  };

  it("instantiates a valid user", async () => {
    const user = new UserSequelizeModel({
      email: "asd@qwe.com",
      dni: DniGenerator.generate(),
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
  });

  it("instantiates a valid user with no dni", async () => {
    const user = new UserSequelizeModel({
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
    expect(user.dni).toBeUndefined();
  });

  it("instantiates a valid fiuba user", async () => {
    const user = new UserSequelizeModel({
      email: "asd@qwe.com",
      dni: DniGenerator.generate(),
      name: "name",
      surname: "surname"
    });
    expect(user.isFiubaUser()).toBe(true);
    expect(() => user.validateUser()).not.toThrow();
  });

  it("instantiates a user with no password when a dni is given", async () => {
    const user = new UserSequelizeModel({
      email: "asd@qwe.com",
      dni: DniGenerator.generate(),
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
    expect(user.password).toBeUndefined();
  });

  it("instantiates a valid user with a very long name", async () => {
    const params = {
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "A Very Very Very Very Very Very Very Very Very Very Very Long Name",
      surname: "surname"
    };
    const user = new UserSequelizeModel(params);
    await expect(user.validate()).resolves.not.toThrow();
    expect(user).toBeObjectContaining({ uuid: null, ...params });
  });

  it("throws an error if name has a digit", async () => {
    const user = new UserSequelizeModel({
      uuid: UUID.generate(),
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: 1,
      surname: "surname"
    });
    await expect(user.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
  });

  it("throws an error if surname has a digit", async () => {
    const user = new UserSequelizeModel({
      uuid: UUID.generate(),
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "name",
      surname: 22
    });
    await expect(user.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NameWithDigitsError.buildMessage()
    );
  });

  it("throws an error if no name is provided", async () => {
    await expectToThrowErrorForMissingAttribute("name");
  });

  it("throws an error if no surname is provided", async () => {
    await expectToThrowErrorForMissingAttribute("surname");
  });

  it("throws an error if no email is provided", async () => {
    await expectToThrowErrorForMissingAttribute("email");
  });

  it("throws an error if email format is invalid", async () => {
    const email = "asdqwe.com";
    const user = new UserSequelizeModel({ ...userAttributes, email });
    await expect(user.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidEmailError.buildMessage(email)
    );
  });

  it("throws an error if the user has no password and no dni", async () => {
    const attributes = omit(userAttributes, ["password", "dni"]);
    const user = new UserSequelizeModel(attributes);
    await expect(user.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      MissingDniError.buildMessage()
    );
  });

  it("tests invalid password match", async () => {
    const user = new UserSequelizeModel(userAttributes);
    expect(await user.passwordMatches("somethingElse")).toBe(false);
  });
});
