export class UnknownNotificationError extends Error {
  public static buildMessage(notificationClassName: string) {
    return `The given notification: ${notificationClassName} is unknown`;
  }

  constructor(notificationClassName: string) {
    super(UnknownNotificationError.buildMessage(notificationClassName));
  }
}
