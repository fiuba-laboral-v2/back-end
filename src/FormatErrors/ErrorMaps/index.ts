import { uniqueConstraint } from "./UniqueConstraint";
import { foreignKeyConstraint } from "./ForeignKeyConstraint";
export { IMapItem } from "./IMapItem";

export const errorMap = [
  uniqueConstraint,
  foreignKeyConstraint
];
