import { AdminTaskType } from "./Model";
import { ApprovalStatus } from "../ApprovalStatus";

export interface IAdminTasksFilter {
  adminTaskTypes: AdminTaskType[];
  statuses: ApprovalStatus[];
}
