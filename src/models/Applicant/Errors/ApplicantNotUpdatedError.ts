export class ApplicantNotUpdatedError extends Error {
  public static buildMessage(uuid: string) {
    return `Applicant with uuid: ${uuid} could not be updated`;
  }

  constructor(uuid: string) {
    super(ApplicantNotUpdatedError.buildMessage(uuid));
  }
}
