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

  it("instantiates a valid user", async () => {
    const user = new User({
      email: "asd@qwe.com",
      password: "somethingVerySecret123"
    });

    await user.save();
  });

  it("checks for email validity using sequelize", () => {
    const user = new User({
      email: "asdqwe.com",
      password: "somethingVerySecret123"
    });

    expect(user.save()).rejects.toThrow();
  });

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

  it("tests valid password match after creation", async () => {
    const unhashedPassword = "somethingWithDigits99";

    const user = new User({
      email: "asd@qwe.com",
      password: unhashedPassword
    });
    User.beforeCreateHook(user);

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
