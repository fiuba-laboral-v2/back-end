export class BadCredentialsError extends Error {
  public static buildMessage() {
    return "Las credenciales son erróneas";
  }

  constructor() {
    super(BadCredentialsError.buildMessage());
  }
}
