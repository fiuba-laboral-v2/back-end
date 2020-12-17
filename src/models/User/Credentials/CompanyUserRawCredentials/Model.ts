import { isNil } from "lodash";
import { ICredentials } from "../../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { validatePassword } from "validations-fiuba-laboral-v2";
import { PasswordEncryptor } from "$libs/PasswordEncryptor";

export class CompanyUserRawCredentials implements ICredentials {
  public password: string;

  constructor(attributes: ICompanyUserRawCredentialsAttributes) {
    this.setPassword(attributes.password);
  }

  public authenticate(password: string) {
    return PasswordEncryptor.authenticate(password, this.password);
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
