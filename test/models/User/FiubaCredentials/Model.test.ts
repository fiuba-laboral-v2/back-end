import { FiubaCredentials } from "$models/User/FiubaCredentials";
import { AttributeNotDefinedError } from "$models/Errors";
import { DniGenerator } from "$generators/DNI";

describe("FiubaCredentials", () => {
  const dni = DniGenerator.generate();

  it("creates a valid FiubaCredentials", () => {
    const fiubaUser = new FiubaCredentials(dni);
    expect(fiubaUser).toEqual({ dni });
  });

  it("throws an error no dni is provided", () => {
    expect(() => new FiubaCredentials(undefined as any)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("dni")
    );
  });
});
