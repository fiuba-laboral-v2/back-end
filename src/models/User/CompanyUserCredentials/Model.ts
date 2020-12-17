import { isNil } from "lodash";
import { ICredentials } from "../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { validatePassword } from "validations-fiuba-laboral-v2";
import { compare, hashSync } from "bcrypt";

export class CompanyUserCredentials implements ICredentials {
  private static readonly bcryptSaltOrRounds = 10;
  public password: string;

  constructor(attributes: ICompanyUserCredentials) {
    this.setPassword(attributes.password);
  }

  public authenticate(password: string) {
    return compare(password, this.password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    validatePassword(password);
    this.password = hashSync(password, CompanyUserCredentials.bcryptSaltOrRounds);
  }
}

export interface ICompanyUserCredentials {
  password: string;
}
