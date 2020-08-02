export class InvalidEmptyUsernameError extends Error {
  public static buildMessage() {
    return "El DNI del usuario no puede estar vacío";
  }

  constructor() {
    super(InvalidEmptyUsernameError.buildMessage());
  }
}
