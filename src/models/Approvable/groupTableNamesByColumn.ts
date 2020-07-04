import { APPROVABLE_MODELS, TABLE_NAME_COLUMN } from "./Model";
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
