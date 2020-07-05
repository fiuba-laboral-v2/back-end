import {
  APPROVABLE_MODELS,
  ApprovableEntityType,
  ApprovableModelsType,
  TABLE_NAME_COLUMN
} from "./Model";
import { IApprovableFilterOptions } from "./Interfaces";
import { ApprovableEntityTypesIsEmptyError } from "./Errors";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";

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

const getApprovableModels = (approvableEntityTypes?: ApprovableEntityType[]) => {
  if (!approvableEntityTypes) return APPROVABLE_MODELS;
  if (approvableEntityTypes.length === 0) throw new ApprovableEntityTypesIsEmptyError();
  const modelNames = approvableEntityTypes.map(type => type.toString());
  return APPROVABLE_MODELS.filter(model => modelNames.includes(model.name));
};

export const findApprovableQuery = ({ approvableEntityTypes }: IApprovableFilterOptions) => {
  const approvableModels = getApprovableModels(approvableEntityTypes);
  return `
    SELECT ${getRowsToSelect(approvableModels)}
    FROM ${getFullOuterJoin(approvableModels)}
  `;
};
