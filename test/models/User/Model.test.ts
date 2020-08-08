import { ValidationError } from "sequelize";
import generateUuid from "uuid/v4";
import { User } from "$models";
import { MissingDniError } from "$models/User/Errors";
import { UUID_REGEX } from "../index";
import {
  InvalidEmailError,
  NameWithDigitsError,
  PasswordWithoutDigitsError,
  InvalidDniError
} from "validations-fiuba-laboral-v2";
import { DniGenerator } from "$generators/DNI";

describe("User", () => {
  it("instantiates a valid user", async () => {
    const user = new User({
      email: "asd@qwe.com",
      dni: DniGenerator.generate(),
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
  });

  it("instantiates a valid user with no dni", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
    expect(user.dni).toBeUndefined();
  });

  it("instantiates a valid fiuba user", async () => {
    const user = new User({
      email: "asd@qwe.com",
      dni: DniGenerator.generate(),
      name: "name",
      surname: "surname"
    });
    expect(user.isFiubaUser()).toBe(true);
    expect(() => user.validateUser()).not.toThrow();
  });

  it("instantiates a user with no password when a dni is given", async () => {
    const user = new User({
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
    const user = new User(params);
    await expect(user.validate()).resolves.not.toThrow();
    expect(user).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...params
    }));
  });

  describe("Errors", () => {
    const expectToThrowErrorWithDni = async (dni: number) => {
      const user = new User({
        email: "email@gmail.com",
        dni,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidDniError.buildMessage(dni)
      );
    };

    const expectToThrowErrorForMissingFields = async (fields: string[], message: string) => {
      const attributes = {
        uuid: generateUuid(),
        dni: DniGenerator.generate(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      };
      fields.map(field => delete attributes[field]);
      const user = new User(attributes);
      await expect(
        user.validate()
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        message
      );
    };

    it("throws an error if name has a digit", async () => {
      const user = new User({
        uuid: generateUuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: 1,
        surname: "surname"
      });
      await expect(user.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
    });

    it("throws an error if surname has a digit", async () => {
      const user = new User({
        uuid: generateUuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: 22
      });
      await expect(user.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        NameWithDigitsError.buildMessage())
      ;
    });

    it("throws an error if name is null", async () => {
      await expectToThrowErrorForMissingFields(
        ["name"],
        "notNull Violation: User.name cannot be null"
      );
    });

    it("throws an error if surname is null", async () => {
      await expectToThrowErrorForMissingFields(
        ["surname"],
        "notNull Violation: User.surname cannot be null"
      );
    });

    it("throws an error if email format is invalid", async () => {
      const email = "asdqwe.com";
      const user = new User({
        email: email,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidEmailError.buildMessage(email)
      );
    });

    it("throws an error if the user has no password and no dni", async () => {
      await expectToThrowErrorForMissingFields(["password", "dni"], MissingDniError.buildMessage());
    });

    it("throws an error if dni has more than nine digits", async () => {
      await expectToThrowErrorWithDni(99999999999999);
    });

    it("throws an error if dni has less than nine digits", async () => {
      await expectToThrowErrorWithDni(11);
    });
  });

  describe("Before create", () => {
    it("throws error if password is invalid in before creation hook", async () => {
      const user = new User({
        email: "asd@qwe.com",
        password: "somethingWithoutDigits",
        name: "name",
        surname: "surname"
      });
      expect(
        () => User.beforeCreateHook(user)
      ).toThrow(PasswordWithoutDigitsError);
    });

    it("hashes password before creation", async () => {
      const unhashedPassword = "somethingWithDigits99";
      const user = new User(
        {
          email: "asd@qwe.com",
          password: unhashedPassword,
          name: "name",
          surname: "surname"
        });
      User.beforeCreateHook(user);
      expect(user.password).not.toEqual(unhashedPassword);
    });
  });

  describe("After create", () => {
    it("tests valid password match after creation", async () => {
      const unhashedPassword = "somethingWithDigits99";

      const user = new User({
        email: "asd@qwe.com",
        password: unhashedPassword,
        name: "name",
        surname: "surname"
      });
      User.beforeCreateHook(user);

      expect(await user.passwordMatches(unhashedPassword)).toBe(true);
    });
  });

  it("tests invalid password match", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingWithDigits99",
      name: "name",
      surname: "surname"
    });

    expect(await user.passwordMatches("somethingElse")).toBe(false);
  });
});
