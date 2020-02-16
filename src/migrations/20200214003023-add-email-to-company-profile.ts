import { STRING, QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.addColumn(
          "CompanyProfiles",
          "email",
          STRING
        );
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeColumn(
          "CompanyProfiles",
          "email"
        );
    }
};
