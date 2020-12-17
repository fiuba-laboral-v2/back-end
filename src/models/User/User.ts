import { InvalidAttributeFormatError, AttributeNotDefinedError } from "$models/Errors";
import { UUID } from "$models/UUID";
import { isNil } from "lodash";
import { validateEmail, validateName } from "validations-fiuba-laboral-v2";

export abstract class User {
  public uuid?: string;
  public email: string;
  public name: string;
  public surname: string;

  protected constructor(attributes: IUserAttributes) {
    this.setUuid(attributes.uuid);
    this.setEmail(attributes.email);
    this.setName(attributes.name);
    this.setSurname(attributes.surname);
  }

  public setUuid(uuid?: string) {
    if (uuid && !UUID.validate(uuid)) throw new InvalidAttributeFormatError("uuid");
    this.uuid = uuid;
  }

  private setEmail(email: string) {
    const attributeName = "email";
    if (isNil(email)) throw new AttributeNotDefinedError(attributeName);
    validateEmail(email);
    this.email = email;
  }

  private setName(name: string) {
    if (isNil(name)) throw new AttributeNotDefinedError("name");
    validateName(name);
    this.name = name;
  }

  private setSurname(surname: string) {
    if (isNil(surname)) throw new AttributeNotDefinedError("surname");
    validateName(surname);
    this.surname = surname;
  }
}

export interface IUserAttributes {
  uuid?: string;
  email: string;
  name: string;
  surname: string;
}
