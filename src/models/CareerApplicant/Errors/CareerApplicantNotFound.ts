export class CareerApplicantNotFound extends Error {
  constructor(applicantUuid: string, careerCode: string) {
    super(
      `careerApplicant with careerCode: ${careerCode} and applicant uuid: ${applicantUuid}`
    );
  }
}
