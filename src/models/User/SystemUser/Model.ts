import { AttributeNotDefinedError } from "$models/Errors";
import { User, IUserAttributes } from "../User";
import { isNil } from "lodash";
import { validatePassword } from "validations-fiuba-laboral-v2";
import { hashSync } from "bcrypt";

export class SystemUser extends User {
  private static readonly bcryptSaltOrRounds = 10;
  public password: string;

  constructor(attributes: ISystemUserAttributes) {
    super(attributes);
    this.setPassword(attributes.password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    validatePassword(password);
    this.password = hashSync(password, SystemUser.bcryptSaltOrRounds);
  }
}

export interface ISystemUserAttributes extends IUserAttributes {
  password: string;
}
