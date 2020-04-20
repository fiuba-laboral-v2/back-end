import { STRING, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn(
      "CompanyProfiles",
      "website",
      STRING
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn(
      "CompanyProfiles",
      "website"
    );
  }
};
