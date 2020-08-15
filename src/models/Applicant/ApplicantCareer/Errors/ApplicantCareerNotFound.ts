export class ApplicantCareerNotFound extends Error {
  public static buildMessage(applicantUuid: string, careerCode: string) {
    return `ApplicantCareer with careerCode: ${careerCode} and applicant uuid: ${applicantUuid}`;
  }

  constructor(applicantUuid: string, careerCode: string) {
    super(ApplicantCareerNotFound.buildMessage(applicantUuid, careerCode));
  }
}
