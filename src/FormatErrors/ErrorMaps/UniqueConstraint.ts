import { UniqueConstraintError } from "sequelize";
import { IMapItem } from "./IMapItem";

interface IUniqueConstraintError {
  table: string;
  columns: string[];
}

const mapItem: IMapItem<IUniqueConstraintError> = {
  message: "UniqueConstraintError",
  data: (error: UniqueConstraintError) => ({
    errorType: error.constructor.name,
    parameters: {
      table: Object.getOwnPropertyDescriptor(error.original, "table")?.value as string,
      columns: Object.keys(error.fields)
    }
  })
};

export const uniqueConstraint = {
  SequelizeUniqueConstraintError: mapItem
};
