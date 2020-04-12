import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Capability } from "../../../src/models/Capability";
import { ApplicantCapability } from "../../../src/models/ApplicantCapability";
import { UniqueConstraintError } from "sequelize";

describe("Applicant model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  afterAll(async () => {
    await Database.close();
  });

  afterEach(async () => {
    await Capability.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  it("create a valid capability", async () => {
    const capability: Capability = new Capability({ description: "Python" });

    await capability.save();

    expect(capability).not.toBeNull();
    expect(capability).not.toBeUndefined();
  });

  it("persist the many to many relation between Capability and Applicant", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });
    const capability: Capability = new Capability({ description: "Python" });
    applicant.capabilities = [capability];
    capability.applicants = [applicant];

    const savedCapability = await capability.save();
    const saverdApplicant = await applicant.save();

    await ApplicantCapability.create({
      capabilityUuid: savedCapability.uuid, applicantUuid: saverdApplicant.uuid
    });
    const result = await Capability.findByPk(savedCapability.uuid, { include: [Applicant] });

    expect(result.applicants[0].name).toEqual(applicant.name);
    expect(result).toEqual(expect.objectContaining({
      uuid: savedCapability.uuid,
      description: savedCapability.description
    }));
  });

  it("raise an error if description is null", async () => {
    const capability: Capability = new Capability();

    await expect(capability.save()).rejects.toThrow();
  });

  it("has case-insensitive unique values for description", async () => {
    await new Capability({ description: "Python" }).save();
    await expect(
      new Capability({ description: "PYTHON" }).save()
    ).rejects.toThrow(UniqueConstraintError);
  });
});
