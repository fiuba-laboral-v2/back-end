import { STRING, INTEGER, QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "CareersApplicants",
      "careerCode",
      {
        type: STRING
      }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "CareersApplicants",
      "careerCode",
      {
        type: INTEGER
      }
    );
  }
};
