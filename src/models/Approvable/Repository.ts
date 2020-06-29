import Database from "../../config/Database";
import { Company } from "../Company";
import { Applicant } from "../Applicant";
import { find } from "lodash";
import { ApprovalStatus } from "../ApprovalStatus";

const APPROVABLE_MODELS = [
  Company,
  Applicant
];

const TABLE_NAME_COLUMN = "tableNameColumn";

const getModelByTableName = (tableName: string) =>
  find(APPROVABLE_MODELS, ["tableName", tableName]);

const getTablesByColumn = () => {
  const tablesByColumn = {};
  APPROVABLE_MODELS.forEach(model => {
    const columnNames = Object.keys(model.rawAttributes).concat([TABLE_NAME_COLUMN]);
    columnNames.forEach(columnName => {
      const tableNames = tablesByColumn[columnName] || [];
      tableNames.push(model.tableName);
      tablesByColumn[columnName] = tableNames;
    });
  });
  return tablesByColumn;
};

const getRowsToSelect = () => {
  const tablesByColumn: object = getTablesByColumn();
  return Object.entries(tablesByColumn).map(([columnName, tableNames]) =>
    `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
  ).join(",");
};

const getFullOuterJoin = () => {
  let selectStatements = APPROVABLE_MODELS.map(model => {
    const tableName = model.tableName;
    return `(
      SELECT *, '${tableName}' AS "${TABLE_NAME_COLUMN}" FROM "${tableName}"
    ) AS ${tableName}`;
  });
  selectStatements = selectStatements.map((selectStatement, index) => {
    if (index === 0) return selectStatement;
    return `${selectStatement} ON FALSE`;
  });
  return selectStatements.join(" FULL OUTER JOIN ");
};

const findApprovablesQuery = () => `
  SELECT ${getRowsToSelect()}
  FROM (${getFullOuterJoin()})
`;

const findPendingQuery = () => {
  return `
    WITH "Approvable" AS (${findApprovablesQuery()})
    SELECT * FROM "Approvable"
    WHERE "Approvable"."approvalStatus" = '${ApprovalStatus.pending}'
    ORDER BY "Approvable"."updatedAt" DESC
  `;
};

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
