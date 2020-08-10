import { User } from "$models";
import { Credentials } from "./Model";
import { MissingPasswordError } from "../Errors";

export class CompanyUserCredentials extends Credentials {
  public static accept(user: User) {
    return !!user.password;
  }

  public validate() {
    if (!this.user.password) throw new MissingPasswordError();
  }
}
