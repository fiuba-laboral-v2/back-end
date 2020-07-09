import {
  APPROVABLE_MODELS,
  AdminTaskType,
  ApprovableModelsType,
  TABLE_NAME_COLUMN
} from "./Model";
import { IApprovableFilter } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { ApprovalStatus } from "../ApprovalStatus";

const getWhereClause = (statuses: ApprovalStatus[]) =>
  statuses.map(status => `"Approvable"."approvalStatus" = '${status}'`).join(" OR ");

const getRowsToSelect = (approvableModels: ApprovableModelsType[]) => {
  const tablesByColumn: object = groupTableNamesByColumn(approvableModels);
  return Object.entries(tablesByColumn).map(([columnName, tableNames]) =>
    `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
  ).join(",");
};

const getFullOuterJoin = (approvableModels: ApprovableModelsType[]) => {
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

const getApprovableModels = (adminTaskTypes: AdminTaskType[]) => {
  const modelNames = adminTaskTypes.map(type => type.toString());
  return APPROVABLE_MODELS.filter(model => modelNames.includes(model.name));
};

const findApprovablesByTypeQuery = (adminTaskTypes: AdminTaskType[]) => {
  const approvableModels = getApprovableModels(adminTaskTypes);
  return `
    SELECT ${getRowsToSelect(approvableModels)}
    FROM ${getFullOuterJoin(approvableModels)}
  `;
};

export const findApprovablesQuery = (
  {
    adminTaskTypes,
    statuses
  }: IApprovableFilter
) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  return `
    WITH "Approvable" AS (${findApprovablesByTypeQuery(adminTaskTypes)})
    SELECT * FROM "Approvable"
    WHERE ${getWhereClause(statuses)}
    ORDER BY "Approvable"."updatedAt" DESC
  `;
};
