export class AdminNotFoundError extends Error {
  public static buildMessage(userUuid: string) {
    return `Admin with uuid: ${userUuid} does not exists`;
  }

  constructor(userUuid: string) {
    super(AdminNotFoundError.buildMessage(userUuid));
  }
}
