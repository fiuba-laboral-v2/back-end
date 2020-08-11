import { CareerRepository } from "$models/Career";
import { ApplicantCareer, Career } from "$models";
import { CareerGenerator } from "$generators/Career";
import { NumberIsTooLargeError, NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";

describe("ApplicantCareer", () => {
  let career: Career;

  beforeAll(async () => {
    await CareerRepository.truncate();
    career = await CareerGenerator.instance();
  });

  it("instantiates a valid applicantCareer", async () => {
    const attributes = {
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: 12,
      isGraduate: true
    };
    const applicantCareer = new ApplicantCareer(attributes);
    await expect(applicantCareer.validate()).resolves.not.toThrow();
    expect(applicantCareer).toEqual(expect.objectContaining({
      ...attributes,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }));
  });

  it("instantiates a applicantCareer with isGraduate as false by default", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: 12
    });
    expect(applicantCareer.isGraduate).toBe(false);
  });

  it("throws an error if creditsCount is negative", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: -12
    });
    await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooSmallError.buildMessage(0, true)
    );
  });

  it("throws an error if creditsCount is bigger than its careers credits", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits + 12
    });
    await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooLargeError.buildMessage(career.credits, true)
    );
  });

  it("does not throw an error if creditsCount is the same as its careers credits", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: career.code,
      applicantUuid: "sarasa",
      creditsCount: career.credits
    });
    await expect(applicantCareer.validate()).resolves.not.toThrow();
  });
});
