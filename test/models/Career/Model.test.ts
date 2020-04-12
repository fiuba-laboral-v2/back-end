import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";
import { careerMocks } from "./mocks";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

describe("Career model", () => {
  const careerData = careerMocks.careerData();
  beforeAll(async () => {
    await Database.setConnection();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid applicant", async () => {
    const career: Career = new Career({
      code: careerData.code,
      description: careerData.description,
      credits: careerData.credits
    });

    await career.save();

    expect(career).not.toBeNull();
    expect(career).not.toBeUndefined();
  });

  it("Persist the many to many relation between Career and Applicant", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman"
    });
    const career: Career = new Career({ ...careerMocks.careerData() });
    applicant.careers = [career];
    career.applicants = [applicant];

    const savedCareer = await career.save();
    const saverdApplicant = await applicant.save();

    await CareerApplicant.create({
      careerCode: savedCareer.code, applicantUuid: saverdApplicant.uuid, creditsCount: 100
    });
    const result = await Career.findByPk(career.code, { include: [Applicant] });

    expect(result.applicants[0]).toMatchObject({
      name: applicant.name,
      CareerApplicant: {
        applicantUuid: applicant.uuid,
        careerCode: career.code,
        creditsCount: 100
      }
    });
    expect(result).toMatchObject({
      code: career.code,
      description: career.description
    });
  });

  it("should throw an error if credits is 0", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: 0
    });

    await expect(career.save()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw an error if credits is negative", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: -54
    });

    await expect(career.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw an error if code is null", async () => {
    const career: Career = new Career({
      description: "Ingeniería Informática",
      credits: 250
    });

    await expect(career.validate()).rejects.toThrow();
  });

  it("should throw an error if description is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: null,
      credits: 250
    });

    await expect(career.save()).rejects.toThrow();
  });

  it("should throw an error if credits is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática"
    });

    await expect(career.save()).rejects.toThrow();
  });
});
