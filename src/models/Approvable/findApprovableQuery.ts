import { APPROVABLE_MODELS } from "./ApprovableModels";
import { TABLE_NAME_COLUMN } from "./TableNameColumn";

const getTablesByColumn = () => {
  const tablesByColumn = {};
  APPROVABLE_MODELS.forEach(model => {
    const columnNames = Object.keys(model.rawAttributes).concat([TABLE_NAME_COLUMN]);
    columnNames.forEach(columnName => {
      const tableNames = tablesByColumn[columnName] || [];
      tableNames.push(model.tableName);
      tablesByColumn[columnName] = tableNames;
    });
  });
  return tablesByColumn;
};

const getRowsToSelect = () => {
  const tablesByColumn: object = getTablesByColumn();
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
