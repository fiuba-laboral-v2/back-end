import { INTEGER, QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "CareersApplicants",
        {
          careerCode: {
            allowNull: false,
            type: DataType.STRING,
            references: { model: "Careers", key: "code" },
            onDelete: "CASCADE"
          },
          applicantUuid: {
            allowNull: false,
            type: DataType.UUID,
            references: { model: "Applicants", key: "uuid" },
            onDelete: "CASCADE"
          },
          creditsCount: {
            allowNull: false,
            defaultValue: 0,
            type: INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DataType.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataType.DATE
          }
        },
        { transaction }
        );
      await queryInterface.addConstraint(
        "CareersApplicants",
        ["careerCode", "applicantUuid"],
        {
          type: "primary key",
          name: "CareersApplicants_careerCode_applicantUuid_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeConstraint(
        "CareersApplicants",
        "CareersApplicants_careerCode_applicantUuid_key",
        { transaction }
      );
      return queryInterface.dropTable("CareerApplicants");
    });
  }
};
