import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { ApplicantCareerNotFound } from "$models/Applicant/ApplicantCareer/Errors";
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
        careers: [{
          careerCode,
          isGraduate: true
        }]
      });
      const applicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        applicantUuid,
        careerCode
      );
      expect(applicantCareer).toEqual(expect.objectContaining({
        careerCode,
        isGraduate: true,
        approvedYearCount: null,
        approvedSubjectCount: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it("throws an error if the applicantCareer does not exists", async () => {
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

  it("returns no applicantCareers", async () => {
    await ApplicantCareersRepository.truncate();
    expect(await ApplicantCareersRepository.findAll()).toEqual([]);
  });
});
