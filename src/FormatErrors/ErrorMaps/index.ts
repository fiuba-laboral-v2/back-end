import { uniqueConstraintErrorMapError } from "./UniqueConstraintErrorMapError";
import { foreignKeyConstraintErrorMapError } from "./ForeignKeyConstraintErrorMapError";
export { IMapItem } from "./IMapItem";

export const errorMap = [
  uniqueConstraintErrorMapError,
  foreignKeyConstraintErrorMapError
];
