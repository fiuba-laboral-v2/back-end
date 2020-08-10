import {
  FiubaUsersService,
  InvalidEmptyPasswordError,
  InvalidEmptyUsernameError
} from "$services/FiubaUsers";
import { Environment } from "$config/Environment";
import { DniGenerator } from "$generators/DNI";

describe("FiubaUsersService", () => {
  const expectToReturnTrueForEnvironment = async (environment: string) => {
    Environment.NODE_ENV = environment;
    expect(
      await FiubaUsersService.authenticate({ dni: DniGenerator.generate(), password: "password" })
    ).toBe(true);
  };

  afterEach(() => Environment.NODE_ENV = Environment.TEST);

  it("throws an error if the username is empty", async () => {
    await expect(
      FiubaUsersService.authenticate({
        dni: "",
        password: "password"
      })
    ).rejects.toThrowErrorWithMessage(
      InvalidEmptyUsernameError,
      InvalidEmptyUsernameError.buildMessage()
    );
  });

  it("throws an error if the password is empty", async () => {
    await expect(
      FiubaUsersService.authenticate({
        dni: DniGenerator.generate(),
        password: ""
      })
    ).rejects.toThrowErrorWithMessage(
      InvalidEmptyPasswordError,
      InvalidEmptyPasswordError.buildMessage()
    );
  });

  it("always returns true in the test environment", async () => {
    await expectToReturnTrueForEnvironment(Environment.TEST);
  });

  it("always returns true in the development environment", async () => {
    await expectToReturnTrueForEnvironment(Environment.DEVELOPMENT);
  });

  it("always returns true in the test_travis environment", async () => {
    await expectToReturnTrueForEnvironment(Environment.TEST_TRAVIS);
  });
});
