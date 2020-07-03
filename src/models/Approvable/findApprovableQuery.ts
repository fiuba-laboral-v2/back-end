import { APPROVABLE_MODELS } from "./ApprovableModels";
import { TABLE_NAME_COLUMN } from "./TableNameColumn";
import { groupTableNamesByColumn } from "./groupTableNamesByColumn";

const getRowsToSelect = () => {
  const tablesByColumn: object = groupTableNamesByColumn();
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

export const findApprovableQuery = () => `
  SELECT ${getRowsToSelect()}
  FROM (${getFullOuterJoin()})
`;
