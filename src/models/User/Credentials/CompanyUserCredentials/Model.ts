import { PasswordEncryptor } from "$libs/PasswordEncryptor";
import { BadCredentialsError } from "$models/User";
import { ICredentials } from "$models/User/Interface";

export abstract class CompanyUserCredentials implements ICredentials {
  public password: string;

  public async authenticate(password: string) {
    const isValid = await PasswordEncryptor.passwordMatches(password, this.password);
    if (!isValid) throw new BadCredentialsError();
  }
}
