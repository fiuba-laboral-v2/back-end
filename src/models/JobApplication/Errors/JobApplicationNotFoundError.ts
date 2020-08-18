export class JobApplicationNotFoundError extends Error {
  public static buildMessage(offerUuid: string, applicantUuid: string) {
    return `JobApplication with offerUuid: ${offerUuid} and applicantUuid: ${applicantUuid} does not exist`;
  }

  constructor(offerUuid: string, applicantUuid: string) {
    super(JobApplicationNotFoundError.buildMessage(offerUuid, applicantUuid));
  }
}
