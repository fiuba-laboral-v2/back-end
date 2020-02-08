import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";

describe("Applicant model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Career.destroy({ truncate: true });
    await Applicant.destroy({ truncate: true });
    await CareerApplicant.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  test("create a valid applicant", async () => {
    const career: Career = new Career({
      code: 1,
      description: "Ingeniería Informática",
      credits: 250
    });

    await career.save();

    expect(career).not.toBeNull();
    expect(career).not.toBeUndefined();
  });

  test("Persist the many to many relation between Career and Applicant", async () => {
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
    const result = await Career.findByPk(career.code ,{ include: [Applicant] });

    expect(result.applicants[0].name).toEqual(applicant.name);
    expect(result).toEqual(expect.objectContaining({
      code: career.code,
      description: career.description,
      credits: career.credits
    }));
  });

  test("raise an error if code is null", async () => {
    const career: Career = new Career({
      description: "Ingeniería Informática",
      credits: 250
    });

    await expect(career.save()).rejects.toThrow();
  });

  test("raise an error if description is null", async () => {
    const career: Career = new Career({
      code: 1,
      description: null,
      credits: 250
    });

    await expect(career.save()).rejects.toThrow();
  });

  test("raise an error if credits is null", async () => {
    const career: Career = new Career({
      code: 1,
      description: "Ingeniería Informática"
    });

    await expect(career.save()).rejects.toThrow();
  });
});
