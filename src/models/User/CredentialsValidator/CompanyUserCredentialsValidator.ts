import { User } from "$models";
import { ICredentialsValidator } from "./Interfaces";

export const CompanyUserCredentialsValidator: ICredentialsValidator = {
  validate: (_: User) => true,
  accept: (user: User) => !!user.password
};
