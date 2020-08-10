import { User } from "$models";

export interface ICredentialsValidator {
  validate: (user: User) => void;
  accept: (user: User) => boolean;
}
