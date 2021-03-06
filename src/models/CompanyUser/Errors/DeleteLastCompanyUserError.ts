export class DeleteLastCompanyUserError extends Error {
  public static buildMessage(companyUuid: string) {
    return `Cannot delete the last company user from the company: ${companyUuid}`;
  }

  constructor(companyUuid: string) {
    super(DeleteLastCompanyUserError.buildMessage(companyUuid));
  }
}
