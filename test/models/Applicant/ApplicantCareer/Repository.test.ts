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
