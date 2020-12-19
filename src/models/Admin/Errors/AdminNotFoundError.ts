export class AdminNotFoundError extends Error {
  public static buildMessage(userUuid: string) {
    return `Admin with uuid: ${userUuid} does not exist`;
  }

  constructor(userUuid: string) {
    super(AdminNotFoundError.buildMessage(userUuid));
  }
}
