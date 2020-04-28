import { ForeignKeyConstraintError } from "sequelize";

import { IMapItem } from "./IMapItem";

interface IForeignKeyConstraintErrorParameters {
  table: string;
  columns: string[];
}

const mapItem: IMapItem<IForeignKeyConstraintErrorParameters> = {
  message: "SequelizeForeignKeyConstraintError",
  data: (error: ForeignKeyConstraintError) => ({
    errorType: error.constructor.name,
    parameters: {
      table: error.table,
      columns: Object.keys(error.fields || {})
    }
  })
};

export const foreignKeyConstraint = {
  SequelizeForeignKeyConstraintError: mapItem
};
