import { AdminTaskModelsType, TABLE_NAME_COLUMN } from "./Model";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  adminTaskModelsTypes.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  groupBy(mapAllModelsToTableNameColumnTuple(adminTaskModelsTypes), "column");

export const groupTableNamesByColumn = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  mapValues(groupByColumns(adminTaskModelsTypes), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
