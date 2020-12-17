import { isNil } from "lodash";
import { ICredentials } from "../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { validatePassword } from "validations-fiuba-laboral-v2";

export class CompanyUserRawCredentials implements ICredentials {
  public password: string;

  constructor(attributes: ICompanyUserCredentials) {
    this.setPassword(attributes.password);
  }

  public authenticate(password: string) {
    return Promise.resolve(this.password === password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    validatePassword(password);
    this.password = password;
  }
}

export interface ICompanyUserCredentials {
  password: string;
}
