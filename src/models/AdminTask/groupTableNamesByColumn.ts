import { AdminTaskModelsType, TABLE_NAME_COLUMN } from "./Model";
import { groupBy, mapValues } from "lodash";
import { Secretary } from "$models/Admin/Interface";
import { Offer } from "$models/Offer";

const getColumns = (model: AdminTaskModelsType, secretary: Secretary) => {
  let columns = Object.keys(model.rawAttributes);
  const filterColumn = secretary === Secretary.graduados ?
    "extensionApprovalStatus" : "graduadosApprovalStatus";

  if (typeof model === typeof Offer) columns = columns.filter(column => column !== filterColumn);
  return [TABLE_NAME_COLUMN].concat(columns);
};

const mapModelToTableNameColumnTuple = (model: AdminTaskModelsType, secretary: Secretary) =>
  getColumns(model, secretary).map(column => ({ tableName: model.tableName, column }));

const mapAllModelsToTableNameColumnTuple = (
  adminTaskModelsTypes: AdminTaskModelsType[],
  secretary: Secretary
) =>
  adminTaskModelsTypes.map(model => mapModelToTableNameColumnTuple(model, secretary)).flat();

const groupByColumns = (adminTaskModelsTypes: AdminTaskModelsType[], secretary: Secretary) =>
  groupBy(mapAllModelsToTableNameColumnTuple(adminTaskModelsTypes, secretary), "column");

export const groupTableNamesByColumn = (
  adminTaskModelsTypes: AdminTaskModelsType[],
  secretary: Secretary
) =>
  mapValues(groupByColumns(adminTaskModelsTypes, secretary), columnTableObjects =>
    columnTableObjects.map(columnTableObject => columnTableObject.tableName)
);
