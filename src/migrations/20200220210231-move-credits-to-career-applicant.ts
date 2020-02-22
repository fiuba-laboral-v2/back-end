import { INTEGER, QueryInterface } from "sequelize";

export = {
    up: async (queryInterface: QueryInterface) => {
      await queryInterface.removeColumn(
        "Applicants",
        "credits"
      );

      return queryInterface.addColumn(
        "CareersApplicants",
        "creditsCount",
        {
          allowNull: false,
          defaultValue: 0,
          type: INTEGER
        }
      );
    },

    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeColumn(
        "CareersApplicants",
        "creditsCount"
      );

      return queryInterface.addColumn(
        "Applicants",
        "credits",
        {
          allowNull: false,
          type: INTEGER
        }
      );
    }
};
