import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CareersApplicants", {
      careerCode: {
        allowNull: false,
        primaryKey: true,
        type: DataType.TEXT,
        references: { model: "Careers", key: "code" }
      },
      applicantUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID,
        references: { model: "Applicants", key: "uuid" }
      },
      createdAt: {
        allowNull: false,
        type: DataType.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataType.DATE
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CareerApplicants");
  }
};
