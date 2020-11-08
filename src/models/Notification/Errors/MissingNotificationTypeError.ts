export class MissingNotificationTypeError extends Error {
  public static buildMessage() {
    return "Notification has not type";
  }

  constructor() {
    super(MissingNotificationTypeError.buildMessage());
  }
}
