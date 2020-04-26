import { ForeignKeyConstraintError } from "sequelize";

import { IMapItem } from "./IMapItem";

interface IForeignKeyConstraintError {
  table: string;
  columns: string[];
}

const mapItem: IMapItem<IForeignKeyConstraintError> = {
  message: "SequelizeForeignKeyConstraintError",
  data: (error: ForeignKeyConstraintError) => ({
    errorType: error.constructor.name,
    parameters: {
      table: error.table,
      columns: Object.keys(error.fields || {})
    }
  })
};

export const foreignKeyConstraintErrorMapError = {
  SequelizeForeignKeyConstraintError: mapItem
};
