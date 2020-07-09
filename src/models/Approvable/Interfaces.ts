import { AdminTaskType } from "./Model";
import { ApprovalStatus } from "../ApprovalStatus";

export interface IApprovableFilter {
  adminTaskTypes: AdminTaskType[];
  statuses: ApprovalStatus[];
}
