export class FiubaUserNotFoundError extends Error {
  public static buildMessage(dni: string) {
    return `The user with DNI: ${dni} does not exist as a Fiuba user`;
  }

  constructor(dni: string) {
    super(FiubaUserNotFoundError.buildMessage(dni));
  }
}
