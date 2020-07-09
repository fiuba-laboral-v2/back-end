import { ApprovableEntityType } from "./Model";
import { ApprovalStatus } from "../ApprovalStatus";

export interface IApprovableFilter {
  approvableEntityTypes: ApprovableEntityType[];
  statuses: ApprovalStatus[];
}
