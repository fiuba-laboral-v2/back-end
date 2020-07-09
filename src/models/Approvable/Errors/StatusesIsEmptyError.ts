export class StatusesIsEmptyError extends Error {
  public static buildMessage() {
    return `No ApprovalStatus was provided`;
  }
  constructor() {
    super(StatusesIsEmptyError.buildMessage());
  }
}
