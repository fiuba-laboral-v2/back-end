import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";
import { ApplicantCapability } from "../../../src/models/ApplicantCapability";
import { Capability } from "../../../src/models/Capability";


describe("Applicant model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Applicant.destroy({ truncate: true });
    await Career.destroy({ truncate: true });
    await CareerApplicant.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid applicant", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });
    const career: Career = new Career({
      code: 1,
      description: "Ingeniería Informática",
      credits: 250
    });
    const capability: Capability = new Capability({ description: "Python" });

    applicant.careers = [ career ];
    applicant.capabilities = [ capability ];

    expect(applicant).not.toBeNull();
    expect(applicant).not.toBeUndefined();
    expect(applicant.careers).not.toBeUndefined();
    expect(applicant.careers).not.toBeNull();
    expect(applicant.careers).toHaveLength(1);
    expect(applicant.capabilities).not.toBeUndefined();
    expect(applicant.capabilities).not.toBeNull();
    expect(applicant.capabilities).toHaveLength(1);
  });

  it("Persist the many to many relation between Applicant, Career and Capability", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });
    const career: Career = new Career({
      code: 3,
      description: "Ingeniería Mecanica",
      credits: 250
    });
    const capability: Capability = new Capability({ description: "Python" });

    applicant.careers = [ career ];
    applicant.capabilities = [ capability ];

    career.applicants = [ applicant ];
    capability.applicants = [ applicant ];

    const savedCareer = await career.save();
    const savedCapability = await capability.save();
    const saverdApplicant = await applicant.save();

    await CareerApplicant.create({
       careerCode: savedCareer.code , applicantUuid: saverdApplicant.uuid
    });
    await ApplicantCapability.create({
      capabilityUuid: savedCapability.uuid , applicantUuid: saverdApplicant.uuid
   });
    const result = await Applicant.findOne({
       where: { name: "Bruno" },
       include: [Career, Capability]
    });

    expect(result.careers[0].code).toEqual(career.code);
    expect(result.capabilities[0].uuid).toEqual(savedCapability.uuid);
    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    }));
  });

  it("raise an error if name is null", async () => {
    const applicant: Applicant = new Applicant({
      name: null,
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  it("raise an error if surname is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      padron: 1,
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });


  it("raise an error if padron is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  it("raise an error if description is null", async () => {
    const applicant: Applicant = new Applicant({
      name: null,
      surname: "Diaz",
      padron: 1,
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  it("raise an error if credits is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman"
    });

    await expect(applicant.save()).rejects.toThrow();
  });
});
