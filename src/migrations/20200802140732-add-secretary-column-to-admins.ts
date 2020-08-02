import { QueryInterface, ENUM } from "sequelize";
import { SecretaryEnumValues } from "../models/Admin/Interface";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Admins",
      "secretary",
      {
        allowNull: false,
        type: ENUM<string>({ values: SecretaryEnumValues }),
        defaultValue: "extension"
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn("Admins", "secretary")
};
