import { AdminTaskType } from "./Model";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IAdminTasksFilter {
  adminTaskTypes: AdminTaskType[];
  statuses: ApprovalStatus[];
  updatedBeforeThan?: IPaginatedInput;
  secretary: Secretary;
}
