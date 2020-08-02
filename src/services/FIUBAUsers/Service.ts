import { FIUBAUsersApiClient } from "./FIUBAUsersApiClient";
import { Environment } from "../../config";
import "isomorphic-fetch";
import { ICredentials } from "./Interfaces";
import { InvalidEmptyPasswordError, InvalidEmptyUsernameError } from "./Errors";

export const FIUBAUsers = {
  authenticate: async ({ username, password }: ICredentials) => {
    if (password.length === 0) throw new InvalidEmptyPasswordError();
    if (username.length === 0) throw new InvalidEmptyUsernameError();

    if (Environment.NODE_ENV === Environment.DEVELOPMENT) return true;
    return FIUBAUsersApiClient.authenticate({ username, password });
  }
};
