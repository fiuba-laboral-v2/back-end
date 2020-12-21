import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import {
  AdminTaskType,
  SeparateApprovalAdminTaskTypes,
  SharedApprovalAdminTaskTypes
} from "$models/AdminTask/Model";

export const StatusWhereClause = {
  build: ({ statuses, secretary, tableName, modelName }: IStatusWhereClauseProps) => {
    const conditions: string[] = [];
    const columns: string[] = [];
    if (SharedApprovalAdminTaskTypes.includes(modelName)) {
      columns.push("approvalStatus");
    }
    if (SeparateApprovalAdminTaskTypes.includes(modelName)) {
      columns.push(
        secretary === Secretary.graduados ? "graduadosApprovalStatus" : "extensionApprovalStatus"
      );
    }

    for (const column of columns) {
      for (const status of statuses) {
        conditions.push(`"${tableName}"."${column}" = '${status}'`);
      }
    }
    return `(${conditions.join(" OR ")})`;
  }
};

interface IStatusWhereClauseProps {
  statuses: ApprovalStatus[];
  secretary: Secretary;
  tableName: string;
  modelName: AdminTaskType;
}
