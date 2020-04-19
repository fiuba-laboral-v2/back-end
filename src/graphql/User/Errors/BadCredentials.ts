export class BadCredentials extends Error {
  public static buildMessage() {
    return `Las credenciales son errónes`;
  }

  constructor() {
    super(BadCredentials.buildMessage());
  }
}
