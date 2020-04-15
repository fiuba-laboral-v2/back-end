import Database from "../../../src/config/Database";
import { Career } from "../../../src/models/Career";
import { CareerApplicant } from "../../../src/models/CareerApplicant";
import { NumberIsTooLargeError, NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

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
      applicantUuid: "sarasa",
      creditsCount: -12
    });
    await expect(careerApplicant.validate()).rejects.toThrow(
      NumberIsTooSmallError.buildMessage(0, true)
    );
  });

  it("should throw an error if creditsCount is bigger than its careers credits", async () => {
    const career = await createCareer();
    const careerApplicant = new CareerApplicant({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits + 12
    });
    await expect(careerApplicant.validate()).rejects.toThrow(
      NumberIsTooLargeError.buildMessage(career.credits, true)
    );
  });

  it("should not throw an error if creditsCount is the same as its careers credits", async () => {
    const career = await createCareer();
    const careerApplicant = new CareerApplicant({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits
    });
    await expect(careerApplicant.validate()).resolves.not.toThrow();
  });
});
