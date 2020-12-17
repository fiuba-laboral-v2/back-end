import { isNil } from "lodash";
import { FiubaUsersService } from "$services";
import { AttributeNotDefinedError } from "$models/Errors";

export class FiubaCredentials {
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
