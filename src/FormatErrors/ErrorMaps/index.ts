import { uniqueConstraintErrorMapItem } from "./UniqueConstraint";
import { foreignKeyConstraintErrorMapItem } from "./ForeignKeyConstraint";
export { IMapItem } from "./IMapItem";

export const ErrorMap = [
  { SequelizeUniqueConstraintError: uniqueConstraintErrorMapItem },
  { SequelizeForeignKeyConstraintError: foreignKeyConstraintErrorMapItem }
];
