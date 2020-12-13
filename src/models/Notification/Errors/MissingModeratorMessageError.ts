export class MissingModeratorMessageError extends Error {
  public static buildMessage() {
    return "moderatorMessage must be present";
  }

  constructor() {
    super(MissingModeratorMessageError.buildMessage());
  }
}
