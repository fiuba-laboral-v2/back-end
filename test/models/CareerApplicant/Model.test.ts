import Database from "../../../src/config/Database";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";

const createCareer = async () => await new Career({
  code: "123123",
  description: "Arquitectura",
  credits: 123
}).save();

describe("CareerApplicant", () => {
  beforeAll(async () => await Database.setConnection());

  afterEach(async () => await Career.truncate({ cascade: true }));

  afterAll(async () => await Database.close());

  it("should throw an error if creditsCount is negative", async () => {
    const careerApplicant = new CareerApplicant({
      careerCode: (await createCareer()).code,
      applicantUUID: "sarasa",
      creditsCount: -12
    });
    await expect(careerApplicant.validate()).rejects.toThrow(
      "El número debe ser mayor o igual a 0"
    );
  });

  it("throws an error if creditsCount is bigger than its careers credits", async () => {
    const career = await createCareer();
    const careerApplicant = new CareerApplicant({
      careerCode: career.code,
      applicantUUID: "sarasa",
      creditsCount: career.credits + 12
    });
    await expect(careerApplicant.validate()).rejects.toThrow(
      `El número debe ser menor o igual a ${career.credits}`
    );
  });

  it("should not throw an error if creditsCount is the same as its careers credits", async () => {
    const career = await createCareer();
    const careerApplicant = new CareerApplicant({
      careerCode: career.code,
      applicantUUID: "sarasa",
      creditsCount: career.credits
    });
    await expect(careerApplicant.validate()).resolves.not.toThrow();
  });
});
