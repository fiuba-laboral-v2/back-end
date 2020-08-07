export class MissingPasswordError extends Error {
  public static buildMessage() {
    return "Password must be given to authenticate";
  }

  constructor() {
    super(MissingPasswordError.buildMessage());
  }
}
