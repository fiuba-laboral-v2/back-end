export class JobApplicationsApprovalEventNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `JobApplicationsApprovalEvent with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(JobApplicationsApprovalEventNotFoundError.buildMessage(uuid));
  }
}
