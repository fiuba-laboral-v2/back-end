import { QueryInterface } from "sequelize";
import { dylan, manuel, sebastian } from "./constants/applicants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Applicants",
        [dylan.applicant, manuel.applicant, sebastian.applicant],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantKnowledgeSections",
        [...dylan.sections, ...manuel.sections, ...sebastian.sections],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantsCapabilities",
        [...dylan.capabilities, ...manuel.capabilities, ...sebastian.capabilities],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "ApplicantCareers",
        [...dylan.careers, ...manuel.careers, ...sebastian.careers],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "JobApplications",
        [...dylan.jobApplications, ...manuel.jobApplications, ...sebastian.jobApplications],
        { transaction }
      );
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
