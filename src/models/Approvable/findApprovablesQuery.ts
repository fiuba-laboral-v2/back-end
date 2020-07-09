import {
  APPROVABLE_MODELS,
  ApprovableEntityType,
  ApprovableModelsType,
  TABLE_NAME_COLUMN
} from "./Model";
import { IApprovableFilter } from "./Interfaces";
import { ApprovableEntityTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { ApprovalStatus } from "../ApprovalStatus";

const getWhereClause = (statuses: ApprovalStatus[]) => {
  const numberOfStatuses = statuses.length;
  return statuses.map((status, index) => {
    const clause = `"Approvable"."approvalStatus" = '${status}'`;
    if (index !== numberOfStatuses - 1) return `${clause} OR `;
    return clause;
  }).join("");
};

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

const getApprovableModels = (approvableEntityTypes: ApprovableEntityType[]) => {
  const modelNames = approvableEntityTypes.map(type => type.toString());
  return APPROVABLE_MODELS.filter(model => modelNames.includes(model.name));
};

const findApprovablesByTypeQuery = (approvableEntityTypes: ApprovableEntityType[]) => {
  const approvableModels = getApprovableModels(approvableEntityTypes);
  return `
    SELECT ${getRowsToSelect(approvableModels)}
    FROM ${getFullOuterJoin(approvableModels)}
  `;
};

export const findApprovablesQuery = (
  {
    approvableEntityTypes,
    statuses
  }: IApprovableFilter
) => {
  if (approvableEntityTypes.length === 0) throw new ApprovableEntityTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  return `
    WITH "Approvable" AS (${findApprovablesByTypeQuery(approvableEntityTypes)})
    SELECT * FROM "Approvable"
    WHERE ${getWhereClause(statuses)}
    ORDER BY "Approvable"."updatedAt" DESC
  `;
};
