import { AdminTaskModelsType, TABLE_NAME_COLUMN } from "./Model";
import { groupBy, mapValues } from "lodash";

const getColumns = (model: AdminTaskModelsType) => {
  const columns = Object.keys(model.rawAttributes);
  return [TABLE_NAME_COLUMN].concat(columns);
};

const mapModelToTableNameColumnTuple = (model: AdminTaskModelsType) =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  adminTaskModelsTypes.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  groupBy(mapAllModelsToTableNameColumnTuple(adminTaskModelsTypes), "column");

export const groupTableNamesByColumn = (adminTaskModelsTypes: AdminTaskModelsType[]) =>
  mapValues(groupByColumns(adminTaskModelsTypes), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
