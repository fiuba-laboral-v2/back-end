import { ICurrentUser } from "./UserContext";

interface ICurrentAdmin {
  userUuid: string;
}

export interface IAdminUser extends ICurrentUser {
  admin: ICurrentAdmin;
  company?: undefined;
  applicant?: undefined;
}
