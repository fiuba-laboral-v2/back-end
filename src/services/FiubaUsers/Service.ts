import { FiubaUsersApi } from "./FiubaUsersApi";
import { Environment } from "$config";
import { ICredentials } from "./Interfaces";
import { InvalidEmptyPasswordError, InvalidEmptyUsernameError } from "./Errors";
import "isomorphic-fetch";

export const FiubaUsersService = {
  authenticate: async ({ dni, password }: ICredentials) => {
    if (password.length === 0) throw new InvalidEmptyPasswordError();
    if (dni.length === 0) throw new InvalidEmptyUsernameError();

    if (Environment.isLocal()) return true;
    return FiubaUsersApi.authenticate({ dni, password });
  }
};
