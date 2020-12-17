import { isNil } from "lodash";
import { ICredentials } from "../Interface";
import { FiubaUsersService } from "$services";
import { AttributeNotDefinedError } from "$models/Errors";

export class FiubaCredentials implements ICredentials {
  public dni: string;

  constructor(dni: string) {
    this.setDni(dni);
  }

  public authenticate(password: string) {
    return FiubaUsersService.authenticate({ dni: this.dni, password });
  }

  private setDni(dni: string) {
    if (isNil(dni)) throw new AttributeNotDefinedError("dni");
    this.dni = dni;
  }
}
