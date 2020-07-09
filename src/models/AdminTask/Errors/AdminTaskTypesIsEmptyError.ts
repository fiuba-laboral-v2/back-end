export class AdminTaskTypesIsEmptyError extends Error {
  public static buildMessage() {
    return "adminTaskTypes should have at least one approvable entity type";
  }
  constructor() {
    super(AdminTaskTypesIsEmptyError.buildMessage());
  }
}
