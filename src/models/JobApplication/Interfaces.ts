import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IUpdateApprovalStatus {
  offerUuid: string;
  applicantUuid: string;
  secretary: Secretary;
  status: ApprovalStatus;
}
