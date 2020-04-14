import Database from "../../../src/config/Database";
import { User } from "../../../src/models/User";
import { PasswordWithoutDigitsError, InvalidEmailError } from "validations-fiuba-laboral-v2";
import { UserRepository } from "../../../src/models/User/Repository";

describe("User", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(() => UserRepository.truncate());

  afterAll(async () => {
    await Database.close();
  });

  it("instantiates a valid user", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123"
    });

    await user.save();
  });

  it("should throw an error when creating an user with an existing email", async () => {
    await new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123"
    }).save();
    const secondUSer = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123"
    });

    await expect(secondUSer.save()).rejects.toThrow();
  });

  it("checks for email validity using sequelize", () => {
    const email = "asdqwe.com";
    const user = new User({
      email: email,
      password: "somethingVerySecret123"
    });

    expect(user.save()).rejects.toThrow(InvalidEmailError.buildMessage(email));
  });

  describe("Before create", () => {
    it("checks for password validity before creation", () => {
      const user = new User({
        email: "asd@qwe.com",
        password: "somethingWithoutDigits"
      });

      expect(user.save()).rejects.toThrow(PasswordWithoutDigitsError);
    });

    it("hashes password before creation", () => {
      const unhashedPassword = "somethingWithDigits99";
      const user = new User({ email: "asd@qwe.com", password: unhashedPassword });
      User.beforeCreateHook(user);
      expect(user.password).not.toEqual(unhashedPassword);
    });
  });

  describe("After create", () => {
    it("tests valid password match after creation", async () => {
      const unhashedPassword = "somethingWithDigits99";

      const user = new User({
        email: "asd@qwe.com",
        password: unhashedPassword
      });
      User.beforeCreateHook(user);

      expect(await user.passwordMatches(unhashedPassword)).toBe(true);
    });
  });

  it("tests invalid password match", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingWithDigits99"
    });

    expect(await user.passwordMatches("somethingElse")).toBe(false);
  });
});
