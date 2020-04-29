import { uniqueConstraint } from "./UniqueConstraint";
import { foreignKeyConstraint } from "./ForeignKeyConstraint";
export { IMapItem } from "./IMapItem";

export const ErrorMap = [
  { SequelizeUniqueConstraintError: uniqueConstraint },
  { SequelizeForeignKeyConstraintError: foreignKeyConstraint }
];
