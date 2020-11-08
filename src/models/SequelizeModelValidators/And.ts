import { ModelValidateOptions } from "sequelize/types";
import { ISequelizeModelValidators } from "./Interfaces";

export const And = (...validators: ISequelizeModelValidators[]) => {
  const validate: ModelValidateOptions = Object.assign(
    {},
    ...validators.map(validator => ({ ...validator.validate }))
  );

  return { validate };
};
