export class NotificationsNotUpdatedError extends Error {
  public static buildMessage() {
    return "Could not update the given notifications";
  }

  constructor() {
    super(NotificationsNotUpdatedError.buildMessage());
  }
}
