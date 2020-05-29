import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "CareersApplicants",
      "ApplicantCareers"
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "ApplicantCareers",
      "CareersApplicants"
    );
  }
};
