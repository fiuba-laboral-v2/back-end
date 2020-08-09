export class FiubaUserNotFoundError extends Error {
  public static buildMessage(dni: number) {
    return `The user with DNI: ${dni} does not exist as a Fiuba user`;
  }

  constructor(dni: number) {
    super(FiubaUserNotFoundError.buildMessage(dni));
  }
}
