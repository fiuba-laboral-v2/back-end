import { IUser } from "$models/User";

export interface ICompany {
  cuit: string;
  companyName: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
  user: IUser;
}

export interface ICreateCompany {
  cuit?: string;
  companyName?: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
}

export interface IUpdateCompany extends ICreateCompany {
  uuid: string;
}
