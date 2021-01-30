export class DeleteLastCompanyUserError extends Error {
  public static buildMessage(userUuid: string) {
    return `Cannot delete the last admin: ${userUuid}`;
  }

  constructor(userUuid: string) {
    super(DeleteLastCompanyUserError.buildMessage(userUuid));
  }
}
