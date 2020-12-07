import { ApplicantNotificationSequelizeModel, CompanyNotificationSequelizeModel } from "$models";
import { omit } from "lodash";
import { ValidationError } from "sequelize";

export const SequelizeModelAssertions = {
  expectToThrowErrorOnMissingAttribute: async ({
    attributes,
    attributeName,
    sequelizeModelClass
  }: IExpectToThrowErrorOnMissingAttribute) => {
    const notification = new sequelizeModelClass(omit(attributes, attributeName));
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: ${sequelizeModelClass.name}.${attributeName} cannot be null`
    );
  },
  expectToThrowErrorInInvalidFormat: async ({
    attributes,
    attributeName,
    message,
    sequelizeModelClass
  }: IExpectToThrowErrorInInvalidFormat) => {
    const notification = new sequelizeModelClass({
      ...attributes,
      [attributeName]: "invalidValue"
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(ValidationError, message);
  }
};

type SequelizeModel = CompanyNotificationSequelizeModel | ApplicantNotificationSequelizeModel;
type SequelizeModelConstructor = new (...args: any[]) => SequelizeModel;

interface IExpectToThrowErrorInInvalidFormat {
  attributeName: string;
  message: string;
  attributes: object;
  sequelizeModelClass: SequelizeModelConstructor;
}

interface IExpectToThrowErrorOnMissingAttribute {
  attributeName: string;
  attributes: object;
  sequelizeModelClass: SequelizeModelConstructor;
}
