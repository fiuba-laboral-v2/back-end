export class FiubaUsersServiceFetchError extends Error {
  public static buildMessage() {
    return "Connection with FIUBA service was lost";
  }

  constructor() {
    super(FiubaUsersServiceFetchError.buildMessage());
  }
}
