import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ICreateJobApplicationApprovalEvent {
  offerUuid: string;
  applicantUuid: string;
  adminUserUuid: string;
  status: ApprovalStatus;
}
