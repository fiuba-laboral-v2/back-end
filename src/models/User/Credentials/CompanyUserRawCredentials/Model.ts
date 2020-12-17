import { isNil } from "lodash";
import { ICredentials } from "../../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { validatePassword } from "validations-fiuba-laboral-v2";
import { PasswordEncryptor } from "$libs/PasswordEncryptor";
import { BadCredentialsError } from "$graphql/User/Errors";

export class CompanyUserRawCredentials implements ICredentials {
  public password: string;

  constructor(attributes: ICompanyUserRawCredentialsAttributes) {
    this.setPassword(attributes.password);
  }

  public async authenticate(password: string) {
    const isValid = await PasswordEncryptor.authenticate(password, this.password);
    if (!isValid) throw new BadCredentialsError();
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
