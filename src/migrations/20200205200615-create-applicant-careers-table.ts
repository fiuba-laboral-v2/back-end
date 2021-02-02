import { QueryInterface, DATE, INTEGER, TEXT, UUID, BOOLEAN } from "sequelize";

const TABLE_NAME = "ApplicantCareers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          careerCode: {
            allowNull: false,
            type: TEXT,
            references: { model: "Careers", key: "code" },
            onDelete: "CASCADE"
          },
          applicantUuid: {
            allowNull: false,
            type: UUID,
            references: { model: "Applicants", key: "uuid" },
            onDelete: "CASCADE"
          },
          currentCareerYear: {
            allowNull: true,
            type: INTEGER
          },
          approvedSubjectCount: {
            allowNull: true,
            type: INTEGER
          },
          isGraduate: {
            allowNull: false,
            type: BOOLEAN
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_NAME, ["applicantUuid", "careerCode"], {
        type: "primary key",
        name: "ApplicantCareers_applicantUuid_careerCode_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
