import { isNil } from "lodash";
import { ICredentials } from "../../Interface";
import { FiubaUsersService } from "$services";
import { AttributeNotDefinedError } from "$models/Errors";
import { BadCredentialsError } from "../../Errors";

export class FiubaCredentials implements ICredentials {
  public dni: string;

  constructor(dni: string) {
    this.setDni(dni);
  }

  public async authenticate(password: string) {
    const isValid = await FiubaUsersService.authenticate({ dni: this.dni, password });
    if (!isValid) throw new BadCredentialsError();
  }

  private setDni(dni: string) {
    if (isNil(dni)) throw new AttributeNotDefinedError("dni");
    this.dni = dni;
  }
}
