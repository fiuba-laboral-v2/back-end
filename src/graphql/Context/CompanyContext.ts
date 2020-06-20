import { ApprovalStatus } from "../../models/ApprovalStatus";
import { ICurrentUser } from "./UserContext";

interface ICurrentCompany {
  uuid: string;
  approvalStatus: ApprovalStatus;
}

export interface ICompanyUser extends ICurrentUser {
  adminUuid?: undefined;
  company: ICurrentCompany;
  applicant?: undefined;
}
