export class BadCredentials extends Error {
  public static buildMessage() {
    return "Las credenciales son erróneas";
  }

  constructor() {
    super(BadCredentials.buildMessage());
  }
}
