import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IUpdateApprovalStatus {
  admin: Admin;
  uuid: string;
  status: ApprovalStatus;
}
