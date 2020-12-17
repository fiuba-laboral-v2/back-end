export class ApplicantApprovalEventNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `ApplicantApprovalEvent with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(ApplicantApprovalEventNotFoundError.buildMessage(uuid));
  }
}
