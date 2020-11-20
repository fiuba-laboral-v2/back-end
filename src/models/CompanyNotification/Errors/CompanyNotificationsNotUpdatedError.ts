export class CompanyNotificationsNotUpdatedError extends Error {
  public static buildMessage() {
    return "Could not update the given notifications";
  }

  constructor() {
    super(CompanyNotificationsNotUpdatedError.buildMessage());
  }
}
