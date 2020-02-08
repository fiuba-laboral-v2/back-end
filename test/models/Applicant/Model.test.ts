import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";

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

  test("create a valid applicant", async () => {
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
    applicant.careers = [ career ];

    expect(applicant).not.toBeNull();
    expect(applicant).not.toBeUndefined();
    expect(applicant.careers).not.toBeUndefined();
    expect(applicant.careers).not.toBeNull();
    expect(applicant.careers).toHaveLength(1);
  });

  test("Persist the many to many relation between Applicant and Career", async () => {
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
    applicant.careers = [ career ];
    career.applicants = [ applicant ];

    const savedCareer = await career.save();
    const saverdApplicant = await applicant.save();

    await CareerApplicant.create({
       careerCode: savedCareer.code , applicantUuid: saverdApplicant.uuid
    });
    const result = await Applicant.findOne({ where: { name: "Bruno" }, include: [Career] });

    expect(result.careers[0].code).toEqual(career.code);
    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    }));
  });

  test("raise an error if name is null", async () => {
    const applicant: Applicant = new Applicant({
      name: null,
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  test("raise an error if surname is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      padron: 1,
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });


  test("raise an error if padron is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      description: "Batman",
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  test("raise an error if description is null", async () => {
    const applicant: Applicant = new Applicant({
      name: null,
      surname: "Diaz",
      padron: 1,
      credits: 150
    });

    await expect(applicant.save()).rejects.toThrow();
  });

  test("raise an error if credits is null", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman"
    });

    await expect(applicant.save()).rejects.toThrow();
  });
});
