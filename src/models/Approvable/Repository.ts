import { Database } from "../../config/Database";
import { Company } from "../Company";
import { find } from "lodash";
import { ApprovalStatus } from "../ApprovalStatus";

const APPROVABLE_MODELS = [
  Company
];

const TABLE_NAME_COLUMN = "tableNameColumn";

const getModelByTableName = (tableName: string) =>
  find(APPROVABLE_MODELS, ["tableName", tableName]);

const findPendingQuery = () => `
  SELECT *, '${Company.tableName}' AS "${TABLE_NAME_COLUMN}"
  FROM "${Company.tableName}"
  WHERE "approvalStatus" = '${ApprovalStatus.pending}'
  ORDER BY "updatedAt" DESC
`;

export const ApprovableRepository = {
  findPending: async () => {
    const rows = await Database.query(findPendingQuery(), { type: "SELECT" });
    return rows.map((row: object) => {
      const tableName = row[TABLE_NAME_COLUMN];
      const modelClass = getModelByTableName(tableName);
      if (!modelClass) throw new Error(`Invalid table name: ${tableName}`);
      return new modelClass(row);
    });
  }
};
