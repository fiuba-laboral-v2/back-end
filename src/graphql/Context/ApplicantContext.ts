import { ICurrentUser } from "./UserContext";

interface ICurrentApplicant {
  uuid: string;
}

export interface IApplicantUser extends ICurrentUser {
  adminUuid?: undefined;
  applicant: ICurrentApplicant;
  company?: undefined;
}
