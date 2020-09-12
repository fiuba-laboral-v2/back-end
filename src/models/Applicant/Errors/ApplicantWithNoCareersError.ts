export class ApplicantWithNoCareersError extends Error {
  public static buildMessage(uuid: string) {
    return `Applicant with uuid: ${uuid} has no careers`;
  }

  constructor(uuid: string) {
    super(ApplicantWithNoCareersError.buildMessage(uuid));
  }
}
