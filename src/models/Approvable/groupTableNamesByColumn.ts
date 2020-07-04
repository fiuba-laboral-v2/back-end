import { TABLE_NAME_COLUMN } from "./Model";
import { IFindApprovableOptions } from "./Interfaces";
import { groupBy, mapValues } from "lodash";

const getColumns = model => [TABLE_NAME_COLUMN].concat(Object.keys(model.rawAttributes));

const mapModelToTableNameColumnTuple = model =>
  getColumns(model).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = ({ approvableModels }: IFindApprovableOptions) =>
  approvableModels.map(model => mapModelToTableNameColumnTuple(model)).flat();

const groupByColumns = (options: IFindApprovableOptions) =>
  groupBy(mapAllModelsToTableNameColumnTuple(options), "column");

export const groupTableNamesByColumn = (options: IFindApprovableOptions) =>
  mapValues(groupByColumns(options), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
