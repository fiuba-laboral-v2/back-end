export class AdminNotFoundError extends Error {
  public static buildMessage(userUuid?: string) {
    if (!userUuid) return "Admin not found";
    return `Admin with uuid: ${userUuid} does not exist`;
  }

  constructor(userUuid?: string) {
    super(AdminNotFoundError.buildMessage(userUuid));
  }
}
