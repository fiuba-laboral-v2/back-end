import { uniqueConstraintErrorMapper } from "./UniqueConstraintMapper";
import { foreignKeyConstraintErrorMapper } from "./ForeignKeyConstraintMapper";
import { IErrorMap } from "./IMapItem";

export const ErrorMap: IErrorMap[] = [
  { SequelizeUniqueConstraintError: uniqueConstraintErrorMapper },
  { SequelizeForeignKeyConstraintError: foreignKeyConstraintErrorMapper }
];
