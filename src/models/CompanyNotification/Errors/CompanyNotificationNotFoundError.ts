export class CompanyNotificationNotFoundError extends Error {
  public static buildMessage(uuid?: string) {
    if (!uuid) return "The CompanyNotification does not exist";
    return `The CompanyNotification with uuid: ${uuid} does not exist`;
  }

  constructor(uuid?: string) {
    super(CompanyNotificationNotFoundError.buildMessage(uuid));
  }
}
