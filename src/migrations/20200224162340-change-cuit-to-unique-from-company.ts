import { STRING, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "Companies",
      "cuit",
      {
        type: STRING,
        unique: true
      }
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "Companies",
      "cuit",
      {
        type: STRING,
        unique: false
      }
    );
  }
};
