import { ICreateCompanyUser } from "$models/User";

export interface ICompany {
  cuit: string;
  companyName: string;
  businessName: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
  user: ICreateCompanyUser;
}

export interface IUpdateCompany {
  cuit?: string;
  companyName?: string;
  businessName?: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
}
