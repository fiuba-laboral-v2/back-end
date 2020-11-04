export class MultipleTypeNotificationError extends Error {
  public static buildMessage() {
    return "Notification can only be of one type";
  }

  constructor() {
    super(MultipleTypeNotificationError.buildMessage());
  }
}
