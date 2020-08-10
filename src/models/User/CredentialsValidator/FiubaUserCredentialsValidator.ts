import { User } from "$models";
import { MissingDniError } from "../Errors";
import { ICredentialsValidator } from "./Interfaces";

export const FiubaUserCredentialsValidator: ICredentialsValidator = {
  validate: (user: User) => {
    if (!user.dni) throw new MissingDniError();
  },
  accept: (user: User) => user.isFiubaUser()
};
