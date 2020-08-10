export class MissingPasswordError extends Error {
  public static buildMessage() {
    return "The password should be mandatory";
  }

  constructor() {
    super(MissingPasswordError.buildMessage());
  }
}
