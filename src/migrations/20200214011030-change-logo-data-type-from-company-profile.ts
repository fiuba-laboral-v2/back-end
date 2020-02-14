import { TEXT, STRING, QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn(
          "CompanyProfiles",
          "logo",
          {
              type: TEXT
          }
        );
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn(
          "CompanyProfiles",
          "logo",
          {
              type: STRING
          }
        );
    }
};
