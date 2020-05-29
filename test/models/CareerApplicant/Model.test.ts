import Database from "../../../src/config/Database";
import { Career } from "../../../src/models/Career";
import { ApplicantCareer } from "../../../src/models/ApplicantCareer";
import { NumberIsTooLargeError, NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

const createCareer = async () => await new Career({
  code: "123123",
  description: "Arquitectura",
  credits: 123
}).save();

describe("ApplicantCareer", () => {
  beforeAll(() => Database.setConnection());
  afterEach(() => Career.truncate({ cascade: true }));
  afterAll(() => Database.close());

  it("should throw an error if creditsCount is negative", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: (await createCareer()).code,
      applicantUuid: "sarasa",
      creditsCount: -12
    });
    await expect(applicantCareer.validate()).rejects.toThrow(
      NumberIsTooSmallError.buildMessage(0, true)
    );
  });

  it("should throw an error if creditsCount is bigger than its careers credits", async () => {
    const career = await createCareer();
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits + 12
    });
    await expect(applicantCareer.validate()).rejects.toThrow(
      NumberIsTooLargeError.buildMessage(career.credits, true)
    );
  });

  it("should not throw an error if creditsCount is the same as its careers credits", async () => {
    const career = await createCareer();
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits
    });
    await expect(applicantCareer.validate()).resolves.not.toThrow();
  });
});
