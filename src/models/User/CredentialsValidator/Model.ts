import { User } from "$models";
import { CompanyUserCredentialsValidator } from "./CompanyUserCredentialsValidator";
import { FiubaUserCredentialsValidator } from "./FiubaUserCredentialsValidator";

export const VALIDATORS = [FiubaUserCredentialsValidator, CompanyUserCredentialsValidator];

export const CredentialsValidator = {
  validate: (user: User) => CredentialsValidator.getValidator(user).validate(user),
  getValidator: (user: User) => {
    const validator = VALIDATORS.find(v => v.accept(user));
    if (!validator) throw new Error("NO VALIDATOR FOUND");
    return validator;
  }
};
