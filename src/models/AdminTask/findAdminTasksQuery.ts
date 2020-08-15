import { ADMIN_TASK_MODELS, AdminTaskModelsType, AdminTaskType, TABLE_NAME_COLUMN } from "./Model";
import { IAdminTasksFilter, IStatusType } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin/Interface";

const getStatusWhereClause = (
  statuses: ApprovalStatus[],
  secretary: Secretary,
  statusType: IStatusType
) => {
  const statusColumns: string[] = [];
  if (statusType.includeCommon) {
    statusColumns.push(...statuses.map(status => `"AdminTask"."approvalStatus" = '${status}'`));
  }

  if (statusType.includeSecretary) {
    const secretaryStatusName = secretary === Secretary.graduados ?
      "graduadosApprovalStatus" : "extensionApprovalStatus";
    statusColumns.push(...statuses.map(
      status => `"AdminTask"."${secretaryStatusName}" = '${status}'`
    ));
  }

  return statusColumns.join(" OR ");
};

const getUpdatedAtWhereClause = (updatedBeforeThan?: Date) =>
  updatedBeforeThan && `"AdminTask"."updatedAt" < '${updatedBeforeThan.toISOString()}'`;

const getWhereClause = (
  statuses: ApprovalStatus[],
  secretary: Secretary,
  statusType: IStatusType,
  updatedBeforeThan?: Date
) =>
  [
    getStatusWhereClause(statuses, secretary, statusType),
    getUpdatedAtWhereClause(updatedBeforeThan)
  ].filter(clause => clause).map(clause => `(${clause})`).join(" AND ");

const getRowsToSelect = (adminTaskModelsTypes: AdminTaskModelsType[]) => {
  const tablesByColumn: object = groupTableNamesByColumn(adminTaskModelsTypes);
  return Object.entries(tablesByColumn).map(([columnName, tableNames]) =>
    `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
  ).join(",");
};

const getFullOuterJoin = (adminTaskModelsTypes: AdminTaskModelsType[]) => {
  let selectStatements = adminTaskModelsTypes.map(model => {
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

const incluedeStatus = (adminTaskTypes: AdminTaskType[]) => {
  const commonStatus = adminTaskTypes.filter(type => type !== "Offer");
  return {
    includeCommon: commonStatus.length >= 1,
    includeSecretary: adminTaskTypes.includes(AdminTaskType.Offer)
  };
};

const findAdminTasksByTypeQuery = (adminTaskTypes: AdminTaskType[]) => {
  const adminTaskModelsTypes = getAdminTaskModels(adminTaskTypes);
  return `
    SELECT ${getRowsToSelect(adminTaskModelsTypes)}
    FROM ${getFullOuterJoin(adminTaskModelsTypes)}
  `;
};

export const findAdminTasksQuery = (
  {
    adminTaskTypes,
    statuses,
    updatedBeforeThan,
    limit,
    secretary
  }: IAdminTasksFilter & { limit: number }
) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  const statusTypes = incluedeStatus(adminTaskTypes);
  return `
    WITH "AdminTask" AS (${findAdminTasksByTypeQuery(adminTaskTypes)})
    SELECT * FROM "AdminTask"
    WHERE ${getWhereClause(statuses, secretary, statusTypes, updatedBeforeThan)}
    ORDER BY "AdminTask"."updatedAt" DESC
    LIMIT ${limit}
  `;
};
