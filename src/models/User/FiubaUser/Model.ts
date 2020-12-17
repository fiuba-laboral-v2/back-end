import { AttributeNotDefinedError } from "$models/Errors";
import { User, IUserAttributes } from "../User";
import { isNil } from "lodash";

export class FiubaUser extends User {
  public dni: string;

  constructor(attributes: IFiubaUserAttributes) {
    super(attributes);
    this.setDni(attributes.dni);
  }

  private setDni(dni: string) {
    if (isNil(dni)) throw new AttributeNotDefinedError("dni");
    this.dni = dni;
  }
}

export interface IFiubaUserAttributes extends IUserAttributes {
  dni: string;
}
