export class FiubaUsersServiceFetchError extends Error {
  public static buildMessage() {
    return "Fiuba service has a connection problem";
  }

  constructor() {
    super(FiubaUsersServiceFetchError.buildMessage());
  }
}
