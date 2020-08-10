import {
  FiubaUsersApi,
  FiubaUsersService, FiubaUsersServiceFetchError,
  InvalidEmptyPasswordError,
  InvalidEmptyUsernameError
} from "$services/FiubaUsers";
import { Environment } from "$config/Environment";
import fetchMock from "fetch-mock";
import { DniGenerator } from "$generators/DNI";
import { FiubaUsersServiceConfig } from "$config/services";

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

  it("throws an error if the service has a connection error", async () => {
    fetchMock.mock(
      {
        url: FiubaUsersServiceConfig.url,
        method: "POST",
        headers: FiubaUsersApi.headers()
      },
      {
        throws: new FiubaUsersServiceFetchError()
      }
    );
    Environment.NODE_ENV = Environment.STAGING;
    await expect(
      FiubaUsersService.authenticate({ dni: DniGenerator.generate(), password: "password" })
    ).rejects.toThrowErrorWithMessage(
      FiubaUsersServiceFetchError,
      FiubaUsersServiceFetchError.buildMessage()
    );
    fetchMock.restore();
  });
});
