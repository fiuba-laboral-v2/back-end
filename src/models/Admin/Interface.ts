import { ICreateFiubaUser } from "../User";

export enum Secretary {
  extension = "extension",
  graduados = "graduados"
}

export interface ISaveAdmin {
  user: ICreateFiubaUser;
  secretary: Secretary;
}

export const SecretaryEnumValues = Object.keys(Secretary);
