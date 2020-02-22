import Database from "../../../src/config/Database";
import { UserRepository } from "../../../src/models/User/Repository";
import { User } from "../../../src/models/User";

describe("UserRepository", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await User.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a user", async () => {
    const email = "asd@qwe.com";
    const user = await UserRepository.create({ email: email, password: "AValidPassword123" });

    expect(user.id).not.toBeNull();
    expect(user.email).toEqual(email);
  });

  it("delegates password validation to the model", async () => {
    await expect(UserRepository.create({
      email: "asd@qwe.com",
      password: "an invalid password"
    })).rejects.toThrow();
  });

  it("delegates email validation to the model", async () => {
    await expect(UserRepository.create({
      email: "asd@qwecom",
      password: "AValidPassword123"
    })).rejects.toThrow();
  });

  it("finds a user by email", async () => {
    await UserRepository.create({ email: "bbb@bbb.com", password: "AValidPassword456" });

    const emailToFind = "aaa@aaa.com";
    const userToFind = await UserRepository.create({
      email: emailToFind,
      password: "AValidPassword123"
    });
    const passwordToFind = userToFind.password;

    const foundUser = await UserRepository.findByEmail(emailToFind);

    expect(foundUser.email).toEqual(emailToFind);
    expect(foundUser.password).toEqual(passwordToFind);
  });

  it("returns null when it does not find a user with the given email", async () => {
    await UserRepository.create({ email: "qqq@qqq.com", password: "AValidPassword789" });
    await UserRepository.create({ email: "www@www.com", password: "AValidPassword012" });

    expect(await UserRepository.findByEmail("yyy@yyy.com")).toBeNull();
  });
});
