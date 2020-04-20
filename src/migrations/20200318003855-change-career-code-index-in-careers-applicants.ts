import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint(
      "CareersApplicants",
      "CareersApplicants_careerCode_key"
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.addConstraint(
      "CareersApplicants",
      [ "careerCode" ],
      {
        type: "unique",
        name: "CareersApplicants_careerCode_key"
      }
    );
  }
};
