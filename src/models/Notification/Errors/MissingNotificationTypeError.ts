export class MissingNotificationTypeError extends Error {
  public static buildMessage() {
    return "Notification doesn't have a type";
  }

  constructor() {
    super(MissingNotificationTypeError.buildMessage());
  }
}
