import { Database } from "$config/Database";
import { find } from "lodash";
import { findAdminTasksQuery } from "./findAdminTasksQuery";
import { ADMIN_TASK_MODELS, TABLE_NAME_COLUMN } from "./Model";
import { IAdminTasksFilter } from "./Interfaces";
import { PaginationConfig } from "$config/PaginationConfig";

const getModelByTableName = (tableName: string) =>
  find(ADMIN_TASK_MODELS, ["tableName", tableName]);

export const AdminTaskRepository = {
  find: async (filter: IAdminTasksFilter) => {
    if (filter.adminTaskTypes.length === 0 || filter.statuses.length === 0) {
      return {
        shouldFetchMore: false,
        tasks: []
      };
    }
    const limit = PaginationConfig().itemsPerPage + 1;
    const rows = await Database.query(
      findAdminTasksQuery({ ...filter, limit: limit }),
      { type: "SELECT" }
    );
    return {
      shouldFetchMore: rows.length === limit,
      tasks: rows.slice(0, limit - 1).map((row: object) => {
        const tableName = row[TABLE_NAME_COLUMN];
        const modelClass = getModelByTableName(tableName);
        if (!modelClass) throw new Error(`Invalid table name: ${tableName}`);
        return new modelClass(row);
      })
    };
  }
};
