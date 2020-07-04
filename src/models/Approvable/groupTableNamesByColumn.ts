import { TABLE_NAME_COLUMN } from "./Model";
import { IFindApprovableAttributes } from "./Interfaces";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = ({ approvableModels }: IFindApprovableAttributes) =>
  approvableModels.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (options: IFindApprovableAttributes) =>
  groupBy(mapAllModelsToTableNameColumnTuple(options), "column");

export const groupTableNamesByColumn = (options: IFindApprovableAttributes) =>
  mapValues(groupByColumns(options), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
