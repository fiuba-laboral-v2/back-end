export class AuthenticateUnknownError extends Error {
  public static buildMessage(response: object) {
    return `The Fiuba user soap service returned an unknown error: ${response}`;
  }

  constructor(response: object) {
    super(AuthenticateUnknownError.buildMessage(response));
  }
}
