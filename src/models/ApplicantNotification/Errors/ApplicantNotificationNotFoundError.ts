export class ApplicantNotificationNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `The ApplicantNotification with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(ApplicantNotificationNotFoundError.buildMessage(uuid));
  }
}
