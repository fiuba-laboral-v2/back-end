import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import {
  AdminTaskType,
  SeparateApprovalAdminTaskTypes,
  SharedApprovalAdminTaskTypes
} from "$models/AdminTask/Model";
import intersection from "lodash/intersection";

export const StatusWhereClause = {
  build: ({ statuses, adminTaskTypes, secretary }: IStatusWhereClauseProps) => {
    const conditions: string[] = [];
    const columns: string[] = [];
    if (intersection(adminTaskTypes, SharedApprovalAdminTaskTypes).length > 0) {
      columns.push("approvalStatus");
    }
    if (intersection(adminTaskTypes, SeparateApprovalAdminTaskTypes).length > 0) {
      columns.push(
        secretary === Secretary.graduados ? "graduadosApprovalStatus" : "extensionApprovalStatus"
      );
    }

    for (const column of columns) {
      for (const status of statuses) {
        conditions.push(`"AdminTask"."${column}" = '${status}'`);
      }
    }
    return `(${conditions.join(" OR ")})`;
  }
};

interface IStatusWhereClauseProps {
  statuses: ApprovalStatus[];
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
