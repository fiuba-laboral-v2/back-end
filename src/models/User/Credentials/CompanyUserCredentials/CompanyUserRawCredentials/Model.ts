import { isNil } from "lodash";
import { AttributeNotDefinedError } from "$models/Errors";
import { validatePassword } from "validations-fiuba-laboral-v2";
import { PasswordEncryptor } from "$libs/PasswordEncryptor";
import { CompanyUserCredentials } from "../Model";

export class CompanyUserRawCredentials extends CompanyUserCredentials {
  public password: string;

  constructor(attributes: ICompanyUserRawCredentialsAttributes) {
    super();
    this.setPassword(attributes.password);
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    validatePassword(password);
    this.password = PasswordEncryptor.encrypt(password);
  }
}

interface ICompanyUserRawCredentialsAttributes {
  password: string;
}
