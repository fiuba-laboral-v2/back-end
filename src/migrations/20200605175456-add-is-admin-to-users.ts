import { BOOLEAN, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Users",
      "isAdmin",
      {
        allowNull: false,
        defaultValue: false,
        type: BOOLEAN
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn("Users", "isAdmin")
};
