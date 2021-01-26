export class NotificationEmailLogNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `the NotificationEmailLog with uuid : ${uuid} does not exists`;
  }

  constructor(uuid: string) {
    super(NotificationEmailLogNotFoundError.buildMessage(uuid));
  }
}
