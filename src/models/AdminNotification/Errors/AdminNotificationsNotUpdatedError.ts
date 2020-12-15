export class AdminNotificationsNotUpdatedError extends Error {
  public static buildMessage() {
    return "Could not update the given notifications";
  }

  constructor() {
    super(AdminNotificationsNotUpdatedError.buildMessage());
  }
}
