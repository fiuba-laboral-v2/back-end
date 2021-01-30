export class DeleteLastAdminError extends Error {
  public static buildMessage(userUuid: string) {
    return `Cannot delete the last admin: ${userUuid}`;
  }

  constructor(userUuid: string) {
    super(DeleteLastAdminError.buildMessage(userUuid));
  }
}
