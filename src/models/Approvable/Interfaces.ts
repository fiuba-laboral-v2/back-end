import { ApprovableEntityType } from "./Model";
import { ApprovalStatus } from "../ApprovalStatus";

export interface IApprovableFilterOptions {
  approvableEntityTypes: ApprovableEntityType[];
  statuses: ApprovalStatus[];
}
