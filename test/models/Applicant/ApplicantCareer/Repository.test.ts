import { UniqueConstraintError, ValidationError } from "sequelize";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import {
  ApplicantCareerNotFound,
  ForbiddenCurrentCareerYearError
} from "$models/Applicant/ApplicantCareer/Errors";
import { ApplicantGenerator } from "$generators/Applicant";
import { CareerGenerator } from "$generators/Career";

describe("ApplicantCareersRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
  });

  describe("findByApplicantAndCareer", () => {
    it("returns an applicantCareer", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData({
        careers: [
          {
            careerCode,
            isGraduate: true
          }
        ]
      });
      const applicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        applicantUuid,
        careerCode
      );
      expect(applicantCareer).toEqual(
        expect.objectContaining({
          careerCode,
          isGraduate: true,
          currentCareerYear: null,
          approvedSubjectCount: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });

    it("throws an error if the applicantCareer does not exist", async () => {
      const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
      const { code: careerCode } = await CareerGenerator.instance();
      await expect(
        ApplicantCareersRepository.findByApplicantAndCareer(applicantUuid, careerCode)
      ).rejects.toThrowErrorWithMessage(
        ApplicantCareerNotFound,
        ApplicantCareerNotFound.buildMessage(applicantUuid, careerCode)
      );
    });
  });

  describe("bulkCreate", () => {
    it("creates two applicantCareers", async () => {
      const career1 = await CareerGenerator.instance();
      const career2 = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const applicantCareersData1 = {
        careerCode: career1.code,
        isGraduate: true
      };
      const applicantCareersData2 = {
        careerCode: career2.code,
        isGraduate: false,
        approvedSubjectCount: 20,
        currentCareerYear: 3
      };
      const applicantCareers = await ApplicantCareersRepository.bulkCreate(
        [applicantCareersData1, applicantCareersData2],
        applicant
      );
      expect(applicantCareers).toEqual([
        expect.objectContaining(applicantCareersData1),
        expect.objectContaining(applicantCareersData2)
      ]);
    });

    it("throws an error if it already exists for the same career and applicant", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      await ApplicantCareersRepository.bulkCreate([{ careerCode, isGraduate: true }], applicant);
      await expect(
        ApplicantCareersRepository.bulkCreate([{ careerCode, isGraduate: true }], applicant)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error if one of the applicantCareers data has no isGraduate", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const applicantCareersData = [
        { careerCode, isGraduate: true },
        { careerCode, isGraduate: null as any }
      ];
      await expect(
        ApplicantCareersRepository.bulkCreate(applicantCareersData, applicant)
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: "notNull Violation: ApplicantCareer.isGraduate cannot be null"
        }
      ]);
    });

    it("throws an error if isGraduate is true and currentCareerYear is set", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const applicantCareersData = [{ careerCode, isGraduate: true, currentCareerYear: 2 }];
      await expect(
        ApplicantCareersRepository.bulkCreate(applicantCareersData, applicant)
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: ForbiddenCurrentCareerYearError.buildMessage()
        }
      ]);
    });

    it("throws an error for not null and forbidden attribute errors", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const applicantCareersData = [
        { careerCode, isGraduate: true, currentCareerYear: 2 },
        { careerCode, isGraduate: null as any }
      ];
      await expect(
        ApplicantCareersRepository.bulkCreate(applicantCareersData, applicant)
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: ForbiddenCurrentCareerYearError.buildMessage()
        },
        {
          errorClass: ValidationError,
          message: "notNull Violation: ApplicantCareer.isGraduate cannot be null"
        }
      ]);
    });
  });

  it("returns no applicantCareers", async () => {
    await ApplicantCareersRepository.truncate();
    expect(await ApplicantCareersRepository.findAll()).toEqual([]);
  });
});
