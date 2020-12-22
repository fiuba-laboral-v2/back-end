export class CompanyUserNotFoundError extends Error {
  public static buildMessage() {
    return "CompanyUser does not exist";
  }

  constructor() {
    super(CompanyUserNotFoundError.buildMessage());
  }
}
