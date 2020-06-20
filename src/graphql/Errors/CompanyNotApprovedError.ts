export class CompanyNotApprovedError extends Error {
  public static buildMessage(actualStatus: string) {
    return `Company is not approved. It's actual status is: ${actualStatus}`;
  }

  constructor(actualStatus: string) {
    super(CompanyNotApprovedError.buildMessage(actualStatus));
  }
}
