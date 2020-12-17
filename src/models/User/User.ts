import { InvalidAttributeFormatError, AttributeNotDefinedError } from "$models/Errors";
import { ICredentials } from "./Interface";
import { UUID } from "$models/UUID";
import { isNil } from "lodash";
import { validateName } from "validations-fiuba-laboral-v2";

export class User {
  public uuid?: string;
  public name: string;
  public surname: string;
  public credentials: ICredentials;

  constructor(attributes: IUserAttributes) {
    this.setUuid(attributes.uuid);
    this.setName(attributes.name);
    this.setSurname(attributes.surname);
    this.setCredentials(attributes.credentials);
  }

  public setUuid(uuid?: string) {
    if (uuid && !UUID.validate(uuid)) throw new InvalidAttributeFormatError("uuid");
    this.uuid = uuid;
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

  private setCredentials(credentials: ICredentials) {
    if (isNil(credentials)) throw new AttributeNotDefinedError("credentials");
    this.credentials = credentials;
  }
}

export interface IUserAttributes {
  uuid?: string;
  name: string;
  surname: string;
  credentials: ICredentials;
}
