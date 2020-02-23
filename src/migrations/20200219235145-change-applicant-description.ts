import { TEXT, QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn(
          "Applicants",
          "description",
          {
            allowNull: true,
            type: TEXT
          }
        );
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.changeColumn(
          "Applicants",
          "description",
          {
            allowNull: false,
            type: TEXT
          }
        );
    }
};
