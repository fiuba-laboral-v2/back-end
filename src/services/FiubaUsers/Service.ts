import { FiubaUsersApi } from "./FiubaUsersApi";
import { Environment } from "../../config";
import "isomorphic-fetch";
import { ICredentials } from "./Interfaces";
import {
  InvalidEmptyPasswordError,
  InvalidEmptyUsernameError,
  FiubaUsersServiceFetchError
} from "./Errors";
import { FetchError } from "node-fetch";

export const FiubaUsersService = {
  authenticate: async ({ dni, password }: ICredentials) => {
    if (password.length === 0) throw new InvalidEmptyPasswordError();
    if (dni.length === 0) throw new InvalidEmptyUsernameError();

    if (Environment.NODE_ENV === Environment.DEVELOPMENT) return true;
    if (Environment.NODE_ENV === Environment.TEST) return true;
    if (Environment.NODE_ENV === Environment.TEST_TRAVIS) return true;
    try {
      return FiubaUsersApi.authenticate({ dni, password });
    } catch (error) {
      if (error instanceof FetchError) throw new FiubaUsersServiceFetchError();
      throw error;
    }
  }
};
