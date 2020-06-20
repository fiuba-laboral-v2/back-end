import { ApprovalStatus } from "../../models/ApprovalStatus";

interface ICurrentCompany {
  uuid: string;
  approvalStatus: ApprovalStatus;
}

export interface ICompanyUser {
  uuid: string;
  email: string;
  adminUuid?: undefined;
  company: ICurrentCompany;
  applicantUuid?: undefined;
}
