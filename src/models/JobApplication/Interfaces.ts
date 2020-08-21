import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IUpdateApprovalStatus {
  adminUserUuid: string;
  uuid: string;
  secretary: Secretary;
  status: ApprovalStatus;
}
