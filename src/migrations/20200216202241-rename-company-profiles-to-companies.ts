import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "CompanyProfiles",
      "Companies"
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "Companies",
      "CompanyProfiles"
    );
  }
};
