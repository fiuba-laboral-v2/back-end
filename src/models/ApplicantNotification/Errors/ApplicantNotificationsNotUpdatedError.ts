export class ApplicantNotificationsNotUpdatedError extends Error {
  public static buildMessage() {
    return "Could not update the given notifications";
  }

  constructor() {
    super(ApplicantNotificationsNotUpdatedError.buildMessage());
  }
}
