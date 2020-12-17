import { isNil } from "lodash";
import { AttributeNotDefinedError } from "$models/Errors";
import { CompanyUserCredentials } from "../Model";

export class CompanyUserHashedCredentials extends CompanyUserCredentials {
  public password: string;

  constructor(attributes: ICompanyUserHashedCredentialsAttributes) {
    super();
    this.setPassword(attributes.password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    this.password = password;
  }
}

interface ICompanyUserHashedCredentialsAttributes {
  password: string;
}
