import { isNil } from "lodash";
import { PasswordEncryptor } from "$libs/PasswordEncryptor";
import { ICredentials } from "../../Interface";
import { AttributeNotDefinedError } from "$models/Errors";
import { BadCredentialsError } from "../../Errors";

export class CompanyUserHashedCredentials implements ICredentials {
  public password: string;

  constructor(attributes: ICompanyUserHashedCredentialsAttributes) {
    this.setPassword(attributes.password);
  }

  public async authenticate(password: string) {
    const isValid = await PasswordEncryptor.passwordMatches(password, this.password);
    if (!isValid) throw new BadCredentialsError();
  }

  private setPassword(password: string) {
    if (isNil(password)) throw new AttributeNotDefinedError("password");
    this.password = password;
  }
}

interface ICompanyUserHashedCredentialsAttributes {
  password: string;
}
