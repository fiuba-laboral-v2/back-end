import { ICurrentUser } from "./UserContext";

interface ICurrentAdmin {
  userUuid: string;
}

export interface IAdminUser extends ICurrentUser {
  admin: ICurrentAdmin;
  applicant?: undefined;
  company?: undefined;
}
