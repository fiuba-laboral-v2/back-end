import { ValidationError } from "sequelize";
import generateUuid from "uuid/v4";
import { UUID_REGEX } from "../index";
import { User } from "../../../src/models";
import {
  InvalidEmailError,
  NameWithDigitsError,
  PasswordWithoutDigitsError,
  InvalidDniError
} from "validations-fiuba-laboral-v2";

describe("User", () => {
  it("instantiates a valid user", async () => {
    const user = new User({
      email: "asd@qwe.com",
      dni: 39207999,
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
  });

  it("instantiates a user with no dni", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    });
    await expect(user.validate()).resolves.not.toThrow();
    expect(user.dni).toBeUndefined();
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
      const user = new User({
        uuid: generateUuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: null,
        surname: "surname"
      });
      await expect(user.validate()).rejects.toThrow(ValidationError);
    });

    it("throws an error if surname is null", async () => {
      const user = new User({
        uuid: generateUuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: null
      });
      await expect(user.validate()).rejects.toThrow(ValidationError);
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

    it("throws an error if dni has more than nine digits", async () => {
      const dniWithMoreThanNineNumber = 99999999999999;
      const user = new User({
        email: "email@gmail.com",
        dni: dniWithMoreThanNineNumber,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidDniError.buildMessage(dniWithMoreThanNineNumber)
      );
    });

    it("throws an error if dni has less than nine digits", async () => {
      const dniWithLessThanNineNumber = 11;
      const user = new User({
        email: "email@gmail.com",
        dni: dniWithLessThanNineNumber,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidDniError.buildMessage(dniWithLessThanNineNumber)
      );
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
