import { ValidationError } from "sequelize";
import uuid from "uuid/v4";
import Database from "../../../src/config/Database";
import { User } from "../../../src/models/User";
import { UserRepository } from "../../../src/models/User/Repository";
import {
  NameWithDigitsError,
  PasswordWithoutDigitsError,
  InvalidEmailError
} from "validations-fiuba-laboral-v2";

describe("User", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => UserRepository.truncate());

  afterAll(() => Database.close());

  it("should instantiate a valid user", async () => {
    const params = {
      email: "asd@qwe.com",
      password: "somethingVerySecret123",
      name: "name",
      surname: "surname"
    };
    const user = await User.create(params);

    expect(params).toEqual(expect.objectContaining(
      {
        email: user.email,
        name: user.name,
        surname: user.surname
      }
    ));
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

    it("should throw an error when creating an user with an existing email", async () => {
      await User.create({
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });
      const secondUSer = new User({
        email: "asd@qwe.com",
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });
      await expect(secondUSer.save()).rejects.toThrow();
    });

    it("should throw an error if email format is invalid", async () => {
      const email = "asdqwe.com";
      const user = new User({
        email: email,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });

      await expect(user.save()).rejects.toThrow(InvalidEmailError.buildMessage(email));
    });
  });

  describe("Before create", () => {
    it("checks for password validity before creation", async () => {
      const user = new User({
        email: "asd@qwe.com",
        password: "somethingWithoutDigits",
        name: "name",
        surname: "surname"
      });

      await expect(user.save()).rejects.toThrow(PasswordWithoutDigitsError);
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
