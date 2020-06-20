import { ICurrentUser } from "./UserContext";

export interface IApplicantUser extends ICurrentUser {
  adminUuid?: undefined;
  applicant: { uuid: string; };
  company?: undefined;
}
