import {
  ADMIN_TASK_MODELS,
  AdminTaskType,
  AdminTaskModelsType,
  TABLE_NAME_COLUMN
} from "./Model";
import { IAdminTasksFilter } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { ApprovalStatus } from "../ApprovalStatus";

const getWhereClause = (statuses: ApprovalStatus[]) =>
  statuses.map(status => `"AdminTask"."approvalStatus" = '${status}'`).join(" OR ");

const getRowsToSelect = (approvableModels: AdminTaskModelsType[]) => {
  const tablesByColumn: object = groupTableNamesByColumn(approvableModels);
  return Object.entries(tablesByColumn).map(([columnName, tableNames]) =>
    `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
  ).join(",");
};

const getFullOuterJoin = (approvableModels: AdminTaskModelsType[]) => {
  let selectStatements = approvableModels.map(model => {
    const tableName = model.tableName;
    return `(
      SELECT *, '${tableName}' AS "${TABLE_NAME_COLUMN}" FROM "${tableName}"
    ) AS ${tableName}`;
  });
  selectStatements = selectStatements.map((selectStatement, index) => {
    if (index === 0) return selectStatement;
    return `${selectStatement} ON FALSE`;
  });
  if (selectStatements.length === 1) return selectStatements.join(" FULL OUTER JOIN ");
  return `(${selectStatements.join(" FULL OUTER JOIN ")})`;
};

const getAdminTaskModels = (adminTaskTypes: AdminTaskType[]) => {
  const modelNames = adminTaskTypes.map(type => type.toString());
  return ADMIN_TASK_MODELS.filter(model => modelNames.includes(model.name));
};

const findAdminTasksByTypeQuery = (adminTaskTypes: AdminTaskType[]) => {
  const approvableModels = getAdminTaskModels(adminTaskTypes);
  return `
    SELECT ${getRowsToSelect(approvableModels)}
    FROM ${getFullOuterJoin(approvableModels)}
  `;
};

export const findAdminTasksQuery = (
  {
    adminTaskTypes,
    statuses
  }: IAdminTasksFilter
) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  return `
    WITH "AdminTask" AS (${findAdminTasksByTypeQuery(adminTaskTypes)})
    SELECT * FROM "AdminTask"
    WHERE ${getWhereClause(statuses)}
    ORDER BY "AdminTask"."updatedAt" DESC
  `;
};
