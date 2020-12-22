import { ADMIN_TASK_MODELS, AdminTaskModelsType, AdminTaskType, TABLE_NAME_COLUMN } from "./Model";
import { IAdminTasksFilter } from "./Interfaces";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";
import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";

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

const getFullOuterJoin = ({
  adminTaskModelsTypes,
  limit,
  secretary,
  statuses,
  updatedBeforeThan
}: IGetFullOuterJoin) => {
  let selectStatements = adminTaskModelsTypes.map(model => {
    const tableName = model.tableName;
    return `(
      SELECT *, '${tableName}' AS "${TABLE_NAME_COLUMN}"
      FROM "${tableName}"
      WHERE ${WhereClauseBuilder.build({
        statuses,
        secretary,
        updatedBeforeThan,
        tableName,
        modelName: model.name as AdminTaskType
      })}
      ORDER BY "${tableName}"."updatedAt" DESC, "${tableName}"."uuid" DESC
      LIMIT ${limit}
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

const findAdminTasksByTypeQuery = ({ adminTaskTypes, ...props }: IAdminTasksFilterWithLimit) => {
  const adminTaskModelsTypes = getAdminTaskModels(adminTaskTypes);
  return `
    SELECT ${getRowsToSelect(adminTaskModelsTypes)}
    FROM ${getFullOuterJoin({ adminTaskModelsTypes, ...props })}
  `;
};

export const findAdminTasksQuery = ({
  adminTaskTypes,
  statuses,
  limit,
  ...props
}: IAdminTasksFilterWithLimit) => {
  if (adminTaskTypes.length === 0) throw new AdminTaskTypesIsEmptyError();
  if (statuses.length === 0) throw new StatusesIsEmptyError();
  return `
    WITH "AdminTask" AS (${findAdminTasksByTypeQuery({
      adminTaskTypes,
      statuses,
      limit,
      ...props
    })})
    SELECT * FROM "AdminTask"
    ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
    LIMIT ${limit}
  `;
};

interface IAdminTasksFilterWithLimit extends IAdminTasksFilter {
  limit: number;
}

interface IGetFullOuterJoin extends Omit<IAdminTasksFilterWithLimit, "adminTaskTypes"> {
  adminTaskModelsTypes: AdminTaskModelsType[];
}
