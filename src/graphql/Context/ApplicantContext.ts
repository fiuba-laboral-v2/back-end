import { ICurrentUser } from "./UserContext";

interface ICurrentApplicant {
  uuid: string;
}

export interface IApplicantUser extends ICurrentUser {
  admin?: undefined;
  applicant: ICurrentApplicant;
  company?: undefined;
}
