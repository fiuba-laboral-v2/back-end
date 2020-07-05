export class ApprovableEntityTypesIsEmptyError extends Error {
  public static buildMessage() {
    return "approvableEntityTypes should have at least one approvable entity type";
  }
  constructor() {
    super(ApprovableEntityTypesIsEmptyError.buildMessage());
  }
}
