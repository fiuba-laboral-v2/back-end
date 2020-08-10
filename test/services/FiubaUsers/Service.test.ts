import {
  FiubaUsersService,
  InvalidEmptyPasswordError,
  InvalidEmptyUsernameError
} from "$services/FiubaUsers";
import { DniGenerator } from "$generators/DNI";

describe("FiubaUsersService", () => {
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
    expect(
      await FiubaUsersService.authenticate({ dni: DniGenerator.generate(), password: "password" })
    ).toBe(true);
  });
});
