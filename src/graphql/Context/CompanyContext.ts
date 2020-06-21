import { ICurrentUser } from "./UserContext";

interface ICurrentCompany {
  uuid: string;
}

export interface ICompanyUser extends ICurrentUser {
  adminUuid?: undefined;
  company: ICurrentCompany;
  applicant?: undefined;
}
