import { User } from "$models";
import { MissingDniError } from "../Errors";
import { Credentials } from "./Model";

export class FiubaUserCredentials extends Credentials {
  public static accept(user: User) {
    return !user.password;
  }

  public validate() {
    if (!this.user.dni) throw new MissingDniError();
  }
}
