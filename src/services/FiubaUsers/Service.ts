import { FiubaUsersApi } from "./FiubaUsersApi";
import { Environment } from "../../config";
import "isomorphic-fetch";
import { ICredentials } from "./Interfaces";
import { InvalidEmptyPasswordError, InvalidEmptyUsernameError } from "./Errors";

export const FiubaUsersService = {
  authenticate: async ({ username, password }: ICredentials) => {
    if (password.length === 0) throw new InvalidEmptyPasswordError();
    if (username.length === 0) throw new InvalidEmptyUsernameError();

    if (Environment.NODE_ENV === Environment.DEVELOPMENT) return true;
    if (Environment.NODE_ENV === Environment.TEST) return true;
    if (Environment.NODE_ENV === Environment.TEST_TRAVIS) return true;
    return FiubaUsersApi.authenticate({ username, password });
  }
};
