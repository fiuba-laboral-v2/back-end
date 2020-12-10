import {
  FiubaUsersService,
  FiubaUsersApi,
  InvalidEmptyPasswordError,
  InvalidEmptyUsernameError
} from "$services/FiubaUsers";
import { Environment } from "$config/Environment";
import { DniGenerator } from "$generators/DNI";

describe("FiubaUsersService", () => {
  const expectToReturnTrueForEnvironment = async (environment: string) => {
    jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => environment);
    expect(
      await FiubaUsersService.authenticate({
        dni: DniGenerator.generate(),
        password: "password"
      })
    ).toBe(true);
  };

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

  it("always returns true in the staging environment", async () => {
    await expectToReturnTrueForEnvironment(Environment.STAGING);
  });

  it("calls the fiuba users api in the production environment", async () => {
    const authenticate = jest.fn();
    const parameters = { dni: DniGenerator.generate(), password: "password" };
    jest.spyOn(Environment, "NODE_ENV").mockImplementation(() => Environment.PRODUCTION);
    jest.spyOn(FiubaUsersApi, "authenticate").mockImplementation(authenticate);
    await FiubaUsersService.authenticate(parameters);
    expect(authenticate.mock.calls).toEqual([[parameters]]);
  });
});
