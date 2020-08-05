import { AdminTaskType } from "./Model";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IAdminTasksFilter {
  adminTaskTypes: AdminTaskType[];
  statuses: ApprovalStatus[];
}
