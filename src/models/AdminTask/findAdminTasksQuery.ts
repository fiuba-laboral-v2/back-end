import { ADMIN_TASK_MODELS, AdminTaskModelsType, AdminTaskType, TABLE_NAME_COLUMN } from "./Model";
import { IAdminTasksFilter } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

const getStatusWhereClause = (statuses: ApprovalStatus[]) =>
  statuses.map(status => `"AdminTask"."approvalStatus" = '${status}'`).join(" OR ");

const getUpdatedAtWhereClause = (updatedBeforeThan?: IPaginatedInput) => {
  if (!updatedBeforeThan) return;
  const updatedAtString = updatedBeforeThan.dateTime.toISOString();
  return `
    (
      "AdminTask"."updatedAt" < '${updatedAtString}'
    ) OR (
      "AdminTask"."updatedAt" = '${updatedAtString}'
      AND "AdminTask"."uuid" < '${updatedBeforeThan.uuid}'
    )
  `;
};

const getWhereClause = (statuses: ApprovalStatus[], updatedBeforeThan?: IPaginatedInput) =>
  [
    getStatusWhereClause(statuses),
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
    limit
  }: IAdminTasksFilter & { limit: number }
) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  return `
    WITH "AdminTask" AS (${findAdminTasksByTypeQuery(adminTaskTypes)})
    SELECT * FROM "AdminTask"
    WHERE ${getWhereClause(statuses, updatedBeforeThan)}
    ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
    LIMIT ${limit}
  `;
};
