import { QueryInterface } from "sequelize";
import { sebastian, manuel } from "./constants/applicants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Applicants", [sebastian.applicant, manuel.applicant], {
        transaction
      });
      await queryInterface.bulkInsert(
        "ApplicantKnowledgeSections",
        [...sebastian.sections, ...manuel.sections],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantsCapabilities",
        [...sebastian.capabilities, ...manuel.capabilities],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantCareers",
        [...sebastian.careers, ...manuel.careers],
        { transaction }
      );

      await queryInterface.bulkInsert("JobApplications", [...manuel.jobApplications], {
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("ApplicantKnowledgeSections", {}, { transaction });
      await queryInterface.bulkDelete("ApplicantsCapabilities", {}, { transaction });
      await queryInterface.bulkDelete("ApplicantCareers", {}, { transaction });
      await queryInterface.bulkDelete("JobApplications", {}, { transaction });
      await queryInterface.bulkDelete("Applicants", {}, { transaction });
    });
  }
};
