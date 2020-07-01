import { TABLE_NAME_COLUMN } from "./TableNameColumn";
import { APPROVABLE_MODELS } from "./ApprovableModels";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = () =>
  APPROVABLE_MODELS.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = () => groupBy(mapAllModelsToTableNameColumnTuple(), "column");

export const groupTableNamesByColumn = () => mapValues(groupByColumns(), columnTableObjects =>
  columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
