export class StatusesIsEmptyError extends Error {
  public static buildMessage() {
    return "statuses should have at least one ApprovableStatus";
  }
  constructor() {
    super(StatusesIsEmptyError.buildMessage());
  }
}
