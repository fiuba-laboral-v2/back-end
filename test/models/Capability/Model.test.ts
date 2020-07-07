import { ValidationError } from "sequelize";
import { Database } from "../../../src/config/Database";
import { Capability } from "../../../src/models";

describe("Capability", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("create a valid capability", async () => {
    const capability = new Capability({ description: "Python" });
    await expect(capability.validate()).resolves.not.toThrow();
  });

  it("should throw an error if no description is provided", async () => {
    const capability = new Capability();
    await expect(capability.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if description is nill", async () => {
    const capability = new Capability({ description: null });
    await expect(capability.validate()).rejects.toThrow(ValidationError);
  });
});
