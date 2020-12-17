import { isNil } from "lodash";
import { compare } from "bcrypt";
import { ICredentials } from "../Interface";
import { AttributeNotDefinedError } from "$models/Errors";

export class CompanyUserHashedCredentials implements ICredentials {
  public password: string;

  constructor(attributes: ICompanyUserCredentials) {
    this.setPassword(attributes.password);
  }

  public authenticate(password: string) {
    return compare(password, this.password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    this.password = password;
  }
}

export interface ICompanyUserCredentials {
  password: string;
}
