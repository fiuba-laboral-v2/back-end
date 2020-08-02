export class InvalidEmptyPasswordError extends Error {
  public static buildMessage() {
    return "La contraseña no puede estar vacía";
  }

  constructor() {
    super(InvalidEmptyPasswordError.buildMessage());
  }
}
