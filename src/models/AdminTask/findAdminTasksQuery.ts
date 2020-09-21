import {
  ADMIN_TASK_MODELS,
  AdminTaskModelsType,
  AdminTaskType,
  TABLE_NAME_COLUMN,
  SeparateApprovalAdminTaskTypes,
  SharedApprovalAdminTaskTypes
} from "./Model";
import { IAdminTasksFilter } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { WhereClauseBuilder } from "./WhereClauseBuilder";
import intersection from "lodash/intersection";

const getRowsToSelect = (adminTaskModelsTypes: AdminTaskModelsType[]) => {
  const tablesByColumn: object = groupTableNamesByColumn(adminTaskModelsTypes);
  return Object.entries(tablesByColumn)
    .map(
      ([columnName, tableNames]) =>
        `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
    )
    .join(",");
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

const includeStatus = (adminTaskTypes: AdminTaskType[]) => {
  return {
    includesSharedApprovalModel:
      intersection(adminTaskTypes, SharedApprovalAdminTaskTypes).length >= 1,
    includesSeparateApprovalModel:
      intersection(adminTaskTypes, SeparateApprovalAdminTaskTypes).length >= 1
  };
};

const findAdminTasksByTypeQuery = (adminTaskTypes: AdminTaskType[]) => {
  const adminTaskModelsTypes = getAdminTaskModels(adminTaskTypes);
  return `
    SELECT ${getRowsToSelect(adminTaskModelsTypes)}
    FROM ${getFullOuterJoin(adminTaskModelsTypes)}
  `;
};

export const findAdminTasksQuery = ({
  adminTaskTypes,
  statuses,
  updatedBeforeThan,
  limit,
  secretary
}: IAdminTasksFilter & { limit: number }) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  const approvalStatusOptions = includeStatus(adminTaskTypes);
  return `
    WITH "AdminTask" AS (${findAdminTasksByTypeQuery(adminTaskTypes)})
    SELECT * FROM "AdminTask"
    WHERE ${WhereClauseBuilder.build({
      statuses,
      secretary,
      approvalStatusOptions,
      updatedBeforeThan,
      isTargeted: adminTaskTypes.includes(AdminTaskType.Offer)
    })}
    ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
    LIMIT ${limit}
  `;
};
