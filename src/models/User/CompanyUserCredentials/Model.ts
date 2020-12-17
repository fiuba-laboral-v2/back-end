import { isNil } from "lodash";
import { ICredentials } from "../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { validateEmail, validatePassword } from "validations-fiuba-laboral-v2";
import { compare, hashSync } from "bcrypt";

export class CompanyUserCredentials implements ICredentials {
  private static readonly bcryptSaltOrRounds = 10;
  public email: string;
  public password: string;

  constructor(attributes: ICompanyUserCredentials) {
    this.setEmail(attributes.email);
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

  private setEmail(email: string) {
    const attributeName = "email";
    if (isNil(email)) throw new AttributeNotDefinedError(attributeName);
    validateEmail(email);
    this.email = email;
  }
}

export interface ICompanyUserCredentials {
  email: string;
  password: string;
}
