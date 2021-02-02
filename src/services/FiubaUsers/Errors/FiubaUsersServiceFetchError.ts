import { FetchError } from "node-fetch";

export class FiubaUsersServiceFetchError extends Error {
  public static buildMessage(error: FetchError) {
    return `Connection with FIUBA service was lost: ${error.message}`;
  }

  constructor(error: FetchError) {
    super(FiubaUsersServiceFetchError.buildMessage(error));
  }
}
