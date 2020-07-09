import { Database } from "../../config/Database";
import { find } from "lodash";
import { findApprovablesQuery } from "./findApprovablesQuery";
import { APPROVABLE_MODELS, TABLE_NAME_COLUMN } from "./Model";
import { IApprovableFilter } from "./Interfaces";

const getModelByTableName = (tableName: string) =>
  find(APPROVABLE_MODELS, ["tableName", tableName]);

export const ApprovableRepository = {
  find: async (filter: IApprovableFilter) => {
    if (filter.approvableEntityTypes.length === 0) return [];
    if (filter.statuses.length === 0) return [];
    const rows = await Database.query(findApprovablesQuery(filter), { type: "SELECT" });
    return rows.map((row: object) => {
      const tableName = row[TABLE_NAME_COLUMN];
      const modelClass = getModelByTableName(tableName);
      if (!modelClass) throw new Error(`Invalid table name: ${tableName}`);
      return new modelClass(row);
    });
  }
};
