import { FiubaCredentials } from "$models/User/FiubaCredentials";
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
    it("returns true if the password matches", async () => {
      jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => true);
      const credentials = new FiubaCredentials(dni);
      const isValid = await credentials.authenticate("secretPassword");
      expect(isValid).toBe(true);
    });

    it("returns false if the does not password match", async () => {
      jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => false);
      const credentials = new FiubaCredentials(dni);
      const isValid = await credentials.authenticate("InvalidPassword");
      expect(isValid).toBe(false);
    });
  });
});
