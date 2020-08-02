export class InvalidEmptyUsernameError extends Error {
  public static buildMessage() {
    return "El username no puede estar vacío";
  }

  constructor() {
    super(InvalidEmptyUsernameError.buildMessage());
  }
}
