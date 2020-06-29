import Database from "../../config/Database";
import { find } from "lodash";
import { findPendingQuery } from "./findPendingQuery";
import { APPROVABLE_MODELS } from "./ApprovableModels";
import { TABLE_NAME_COLUMN } from "./TableNameColumn";

const getModelByTableName = (tableName: string) =>
  find(APPROVABLE_MODELS, ["tableName", tableName]);

export const ApprovableRepository = {
  findPending: async () => {
    const rows = await Database.query(findPendingQuery(), { type: "SELECT" });
    return rows.map((row: object) => {
      const tableName = row[TABLE_NAME_COLUMN];
      const modelClass = getModelByTableName(tableName);
      if (!modelClass) throw new Error(`Invalid table name: ${tableName}`);
      return new modelClass(row);
    });
  }
};
