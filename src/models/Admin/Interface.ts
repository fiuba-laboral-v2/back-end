import { IUser } from "../User";

export enum Secretary {
  extension = "extension",
  graduados = "graduados"
}

export interface ISaveAdmin {
  user: IUser;
  secretary: Secretary;
}

export const SecretaryEnumValues = Object.keys(Secretary);
