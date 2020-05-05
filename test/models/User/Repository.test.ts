import Database from "../../../src/config/Database";
import { UserRepository } from "../../../src/models/User/Repository";
import { UserNotFoundError } from "../../../src/models/User";

describe("UserRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => UserRepository.truncate());

  afterAll(() => Database.close());

  it("should create a user", async () => {
    const email = "asd@qwe.com";
    const user = await UserRepository.create(
      {
        email: email,
        password: "AValidPassword123",
        name: "Sebastian",
        surname: "Blanco"
      }
    );

    expect(user.uuid).not.toBeNull();
    expect(user.email).toEqual(email);
  });

  it("delegates password validation to the model", async () => {
    await expect(UserRepository.create({
      email: "asd@qwe.com",
      password: "an invalid password",
      name: "Sebastian",
      surname: "blanco"
    })).rejects.toThrow();
  });

  it("delegates email validation to the model", async () => {
    await expect(UserRepository.create({
      email: "asd@qwecom",
      password: "AValidPassword123",
      name: "Sebastian",
      surname: "blanco"
    })).rejects.toThrow();
  });

  it("should find a user by email", async () => {
    await UserRepository.create(
      {
        email: "bbb@bbb.com",
        password: "AValidPassword456",
        name: "Sebastian",
        surname: "blanco"
      }
    );

    const emailToFind = "aaa@aaa.com";
    const userToFind = await UserRepository.create({
      email: emailToFind,
      password: "AValidPassword123",
      name: "Manuel",
      surname: "Llauro"
    });
    const foundUser = await UserRepository.findByEmail(emailToFind);

    expect(foundUser.email).toEqual(emailToFind);
    expect(foundUser.password).toEqual(userToFind.password);
  });

  it("returns error when it does not find a user with the given email", async () => {
    await UserRepository.create({
      email: "qqq@qqq.com",
      password: "AValidPassword789",
      name: "Sebastian",
      surname: "Blanco"
    });
    await UserRepository.create({
      email: "www@www.com",
      password: "AValidPassword012",
      name: "Dylan",
      surname: "Alvarez"
    });
    await expect(
      UserRepository.findByEmail("yyy@yyy.com")
    ).rejects.toThrow(UserNotFoundError);
  });
});
