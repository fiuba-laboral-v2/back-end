export class MissingDniError extends Error {
  public static buildMessage() {
    return "Fiuba user should have a DNI";
  }

  constructor() {
    super(MissingDniError.buildMessage());
  }
}
