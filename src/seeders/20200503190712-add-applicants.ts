import { QueryInterface } from "sequelize";
import { sebastian, aldana } from "./constants/applicants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Applicants", [sebastian.applicant, aldana.applicant], {
        transaction,
      });
      await queryInterface.bulkInsert("Sections", [...sebastian.sections, ...aldana.sections], {
        transaction,
      });
      await queryInterface.bulkInsert(
        "ApplicantsCapabilities",
        [...sebastian.capabilities, ...aldana.capabilities],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantCareers",
        [...sebastian.careers, ...aldana.careers],
        { transaction }
      );

      await queryInterface.bulkInsert("JobApplications", [...aldana.jobApplications], {
        transaction,
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("Sections", {}, { transaction });
      await queryInterface.bulkDelete("ApplicantsCapabilities", {}, { transaction });
      await queryInterface.bulkDelete("ApplicantCareers", {}, { transaction });
      await queryInterface.bulkDelete("JobApplications", {}, { transaction });
      await queryInterface.bulkDelete("Applicants", {}, { transaction });
    });
  },
};
