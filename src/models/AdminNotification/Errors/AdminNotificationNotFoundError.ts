export class AdminNotificationNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `The AdminNotification with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(AdminNotificationNotFoundError.buildMessage(uuid));
  }
}
