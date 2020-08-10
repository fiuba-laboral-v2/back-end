import { User } from "$models";
import { CompanyUserCredentials } from "./CompanyUserCredentials";
import { FiubaUserCredentials } from "./FiubaUserCredentials";

const VALIDATORS = [CompanyUserCredentials, FiubaUserCredentials];

export const CredentialsFactory = {
  create(user: User) {
    const validator = VALIDATORS.find(v => v.accept(user));
    if (!validator) throw new Error("No validator for user credentials was found");
    return new validator();
  }
};
