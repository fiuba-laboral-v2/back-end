import { ApplicantCareer } from "$models";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";
import {
  ForbiddenApprovedSubjectCountError,
  ForbiddenCurrentCareerYearError,
  MissingApprovedSubjectCountError,
  MissingCurrentCareerYearError,
} from "$models/Applicant/ApplicantCareer/Errors";

describe("ApplicantCareer", () => {
  it("throws and error if applicantUuid has invalid format", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: "10",
      applicantUuid: "invalidUuidFormat",
      isGraduate: false,
    });
    await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: uuid has invalid format"
    );
  });

  it("throws and error if no isGraduate is provided", async () => {
    const applicantCareer = new ApplicantCareer({
      careerCode: "10",
      applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      currentCareerYear: 5,
      approvedSubjectCount: 20,
    });
    await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantCareer.isGraduate cannot be null"
    );
  });

  describe("graduated applicant", () => {
    it("instantiates an applicantCareer for a graduate", async () => {
      const attributes = {
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        isGraduate: true,
      };
      const applicantCareer = new ApplicantCareer(attributes);
      await expect(applicantCareer.validate()).resolves.not.toThrow();
      expect(applicantCareer).toEqual(
        expect.objectContaining({
          ...attributes,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it("throws an error if approvedSubjectCount is provided", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        approvedSubjectCount: 20,
        isGraduate: true,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        ForbiddenApprovedSubjectCountError.buildMessage()
      );
    });

    it("throws error if currentCareerYear is provided", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: 5,
        isGraduate: true,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        ForbiddenCurrentCareerYearError.buildMessage()
      );
    });
  });

  describe("not graduated applicant", () => {
    it("instantiates an applicantCareer for a student", async () => {
      const attributes = {
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: 3,
        approvedSubjectCount: 20,
        isGraduate: false,
      };
      const applicantCareer = new ApplicantCareer(attributes);
      await expect(applicantCareer.validate()).resolves.not.toThrow();
      expect(applicantCareer).toEqual(
        expect.objectContaining({
          ...attributes,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it("throws an error if currentCareerYear is negative", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: -12,
        approvedSubjectCount: 20,
        isGraduate: false,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        NumberIsTooSmallError.buildMessage(0, false)
      );
    });

    it("throws an error if currentCareerYear is zero", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: 0,
        approvedSubjectCount: 20,
        isGraduate: false,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        NumberIsTooSmallError.buildMessage(0, false)
      );
    });

    it("throws an error if approvedSubjectCount is negative", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: 12,
        approvedSubjectCount: -20,
        isGraduate: false,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        NumberIsTooSmallError.buildMessage(0, true)
      );
    });

    it("throws an error if no approvedSubjectCount is provided", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        currentCareerYear: 12,
        isGraduate: false,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        MissingApprovedSubjectCountError.buildMessage()
      );
    });

    it("throws an error if no currentCareerYear is provided", async () => {
      const applicantCareer = new ApplicantCareer({
        careerCode: "10",
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        approvedSubjectCount: 20,
        isGraduate: false,
      });
      await expect(applicantCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        MissingCurrentCareerYearError.buildMessage()
      );
    });
  });
});
