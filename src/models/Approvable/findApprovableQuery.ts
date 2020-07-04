import { APPROVABLE_MODELS, TABLE_NAME_COLUMN } from "./Model";
import { IApprovableFilterOptions, IFindApprovableOptions } from "./Interfaces";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";

const getRowsToSelect = (options: IFindApprovableOptions) => {
  const tablesByColumn: object = groupTableNamesByColumn(options);
  return Object.entries(tablesByColumn).map(([columnName, tableNames]) =>
    `COALESCE (
      ${tableNames.map(tableName => `${tableName}."${columnName}"`).join(",")}
    ) AS "${columnName}"`
  ).join(",");
};

const getFullOuterJoin = ({ approvableModels }: IFindApprovableOptions) => {
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
  return selectStatements.join(" FULL OUTER JOIN ");
};

const getApprovableModels = ({ approvableEntityTypes }: IApprovableFilterOptions) => {
  if (!approvableEntityTypes) return APPROVABLE_MODELS;
  const modelNames = approvableEntityTypes.map(type => type.toString());
  return APPROVABLE_MODELS.filter(model => modelNames.includes(model.name));
};

export const findApprovableQuery = ({ approvableEntityTypes }: IApprovableFilterOptions) => {
  const approvableModels = getApprovableModels({ approvableEntityTypes });
  return `
    SELECT ${getRowsToSelect({ approvableModels })}
    FROM (${getFullOuterJoin({ approvableModels })})
  `;
};
