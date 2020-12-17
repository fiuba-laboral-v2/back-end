import { FiubaCredentials } from "$models/User/Credentials";
import { BadCredentialsError } from "$models/User";
import { FiubaUsersService } from "$services";
import { AttributeNotDefinedError } from "$models/Errors";
import { DniGenerator } from "$generators/DNI";

describe("FiubaCredentials", () => {
  const dni = DniGenerator.generate();

  it("creates a valid FiubaCredentials", () => {
    const credentials = new FiubaCredentials(dni);
    expect(credentials).toEqual({ dni });
  });

  it("throws an error no dni is provided", () => {
    expect(() => new FiubaCredentials(undefined as any)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("dni")
    );
  });

  describe("authenticate", () => {
    it("does not throw an error if the password matches", async () => {
      jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => true);
      const credentials = new FiubaCredentials(dni);
      await expect(credentials.authenticate("secretPassword")).resolves.not.toThrowError();
    });

    it("throws an error if the password does not password match", async () => {
      jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => false);
      const credentials = new FiubaCredentials(dni);
      await expect(credentials.authenticate("secretPassword")).rejects.toThrowErrorWithMessage(
        BadCredentialsError,
        BadCredentialsError.buildMessage()
      );
    });
  });
});
