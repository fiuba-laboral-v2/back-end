export class CompanyApprovalEventNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `CompanyApprovalEvent with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(CompanyApprovalEventNotFoundError.buildMessage(uuid));
  }
}
