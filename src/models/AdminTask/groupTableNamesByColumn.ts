import { ApprovableModelsType, TABLE_NAME_COLUMN } from "./Model";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = (approvableModels: ApprovableModelsType[]) =>
  approvableModels.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (approvableModels: ApprovableModelsType[]) =>
  groupBy(mapAllModelsToTableNameColumnTuple(approvableModels), "column");

export const groupTableNamesByColumn = (approvableModels: ApprovableModelsType[]) =>
  mapValues(groupByColumns(approvableModels), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
