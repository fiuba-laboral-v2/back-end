import { ICurrentUser } from "./UserContext";

interface ICurrentCompany {
  uuid: string;
}

export interface ICompanyUser extends ICurrentUser {
  admin?: undefined;
  applicant?: undefined;
  company: ICurrentCompany;
}
