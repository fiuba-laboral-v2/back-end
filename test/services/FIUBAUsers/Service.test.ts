import {
  FIUBAUsers,
  InvalidEmptyUsernameError,
  InvalidEmptyPasswordError
} from "../../../src/services/FIUBAUsers";

describe("FIUBAUsers", () => {
  it("throws an error if the username is empty", async () => {
    await expect(
      FIUBAUsers.authenticate({
        username: "",
        password: "password"
      })
    ).rejects.toThrowErrorWithMessage(
      InvalidEmptyUsernameError,
      InvalidEmptyUsernameError.buildMessage()
    );
  });

  it("throws an error if the password is empty", async () => {
    await expect(
      FIUBAUsers.authenticate({
        username: "username",
        password: ""
      })
    ).rejects.toThrowErrorWithMessage(
      InvalidEmptyPasswordError,
      InvalidEmptyPasswordError.buildMessage()
    );
  });
});
