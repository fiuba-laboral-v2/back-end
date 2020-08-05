import { CareerRepository } from "$models/Career";
import { ApplicantCareer, Career } from "$models";
import { NumberIsTooLargeError, NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

describe("ApplicantCareer", () => {
  let career: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    career = await Career.create({
      code: "123123",
      description: "Arquitectura",
      credits: 123
    });
  });

  it("should throw an error if creditsCount is negative", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: -12
    });
    await expect(applicantCareer.validate()).rejects.toThrow(
      NumberIsTooSmallError.buildMessage(0, true)
    );
  });

  it("should throw an error if creditsCount is bigger than its careers credits", async () => {
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
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits
    });
    await expect(applicantCareer.validate()).resolves.not.toThrow();
  });
});
