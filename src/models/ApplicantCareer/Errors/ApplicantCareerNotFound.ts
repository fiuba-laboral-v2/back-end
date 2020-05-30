export class ApplicantCareerNotFound extends Error {
  constructor(applicantUuid: string, careerCode: string) {
    super(
      `ApplicantCareer with careerCode: ${careerCode} and applicant uuid: ${applicantUuid}`
    );
  }
}
