import { AdminTaskModelsType, TABLE_NAME_COLUMN } from "./Model";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = (approvableModels: AdminTaskModelsType[]) =>
  approvableModels.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (approvableModels: AdminTaskModelsType[]) =>
  groupBy(mapAllModelsToTableNameColumnTuple(approvableModels), "column");

export const groupTableNamesByColumn = (approvableModels: AdminTaskModelsType[]) =>
  mapValues(groupByColumns(approvableModels), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
