import { User } from "../../../src/models/User/Model";
import { PasswordWithoutDigitsError } from "validations-fiuba-laboral-v2";
import Database from "../../../src/config/Database";

describe("User", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await User.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid user", () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123"
    });

    expect(user.save()).rejects.not.toThrow();
  });

  it("check for email validity using sequelize", () => {
    const user = new User({
      email: "asdqwe.com",
      password: "somethingVerySecret123"
    });

    expect(user.save()).rejects.toThrow();
  });

  it("check for password validity in constructor", () => {
    expect(() => new User({
        email: "asd@qwe.com",
        password: "somethingWithoutDigits"
      })
    ).toThrow(PasswordWithoutDigitsError);
  });

  it("hashes password on create", () => {
    const unhashedPassword = "somethingWithDigits99";

    expect(
      new User({
        email: "asd@qwe.com",
        password: unhashedPassword
      }).password
    ).not.toEqual(unhashedPassword);
  });

  it("tests valid password match", async () => {
    const unhashedPassword = "somethingWithDigits99";

    const user = new User({
      email: "asd@qwe.com",
      password: unhashedPassword
    });

    expect(await user.passwordMatches(unhashedPassword)).toBe(true);
  });

  it("tests invalid password match", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingWithDigits99"
    });

    expect(await user.passwordMatches("somethingElse")).toBe(false);
  });
});
