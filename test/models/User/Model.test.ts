import { ValidationError } from "sequelize";
import uuid from "uuid/v4";
import { Database } from "../../../src/config/Database";
import { User } from "../../../src/models/User";
import {
  InvalidEmailError,
  NameWithDigitsError,
  PasswordWithoutDigitsError
} from "validations-fiuba-laboral-v2";

describe("User", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("instantiates a valid user", async () => {
    const params = {
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "A Very Very Very Very Very Very Very Very Very Very Very Long Name",
      surname: "surname"
    };
    const user = new User(params);
    expect(params).toEqual(expect.objectContaining(
      {
        email: user.email,
        name: user.name,
        surname: user.surname
      }
    ));
    await expect(user.validate()).resolves.not.toThrow();
  });

  describe("Errors", () => {
    it("should throw an error if name has a digit", async () => {
      const user = new User({
        uuid: uuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: 1,
        surname: "surname"
      });
      await expect(user.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
    });

    it("throws an error if surname has a digit", async () => {
      const user = new User({
        uuid: uuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: 22
      });
      await expect(user.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
    });

    it("should throw an error if name is null", async () => {
      const user = new User({
        uuid: uuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: null,
        surname: "surname"
      });
      await expect(user.validate()).rejects.toThrow(ValidationError);
    });

    it("should throw an error if surname is null", async () => {
      const user = new User({
        uuid: uuid(),
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: null
      });
      await expect(user.validate()).rejects.toThrow(ValidationError);
    });

    it("should throw an error if email format is invalid", async () => {
      const email = "asdqwe.com";
      const user = new User({
        email: email,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.validate()).rejects.toThrow(InvalidEmailError.buildMessage(email));
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
