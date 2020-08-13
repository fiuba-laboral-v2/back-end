import { AdminTaskType } from "./Model";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

export interface IAdminTasksFilter {
  adminTaskTypes: AdminTaskType[];
  statuses: ApprovalStatus[];
  updatedBeforeThan?: Date;
  secretary: Secretary;
}
