import { IUser } from "../User";

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

export interface ICompanyEditable {
  uuid: string;
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
