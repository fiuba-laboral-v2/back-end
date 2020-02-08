import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Capability } from "../../../src/models/Capability";
import { ApplicantCapability } from "../../../src/models/ApplicantCapability";

describe("Applicant model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Capability.destroy({ truncate: true });
    await Applicant.destroy({ truncate: true });
    await ApplicantCapability.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  test("create a valid capability", async () => {
    const capability: Capability = new Capability({ description: "Python" });

    await capability.save();

    expect(capability).not.toBeNull();
    expect(capability).not.toBeUndefined();
  });

  test("Persist the many to many relation between Capability and Applicant", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });
    const capability: Capability = new Capability({ description: "Python" });
    applicant.capabilities = [ capability ];
    capability.applicants = [ applicant ];

    const savedCapability = await capability.save();
    const saverdApplicant = await applicant.save();

    await ApplicantCapability.create({
      capabilityUuid: savedCapability.uuid , applicantUuid: saverdApplicant.uuid
    });
    const result = await Capability.findByPk(savedCapability.uuid ,{ include: [Applicant] });

    expect(result.applicants[0].name).toEqual(applicant.name);
    expect(result).toEqual(expect.objectContaining({
      uuid: savedCapability.uuid,
      description: savedCapability.description
    }));
  });
});
