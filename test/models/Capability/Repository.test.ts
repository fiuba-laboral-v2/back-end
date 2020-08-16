import { UniqueConstraintError } from "sequelize";
import { CapabilityRepository } from "$models/Capability";

describe("CapabilityRepository", () => {
  beforeEach(() => CapabilityRepository.truncate());

  it("should create a valid capability", async () => {
    const capability = await CapabilityRepository.create({
      description: "Python",
    });
    expect(capability).toMatchObject({ description: "Python" });
  });

  it("should create two valid capabilities with different descriptions", async () => {
    const python = await CapabilityRepository.create({ description: "Python" });
    const java = await CapabilityRepository.create({ description: "Java" });
    expect(python).toMatchObject({ description: "Python" });
    expect(java).toMatchObject({ description: "Java" });
  });

  it("should throw an error if adding existing case-insensitive description", async () => {
    await CapabilityRepository.create({ description: "Python" });
    await expect(CapabilityRepository.create({ description: "PYTHON" })).rejects.toThrow(
      UniqueConstraintError
    );
  });
});
