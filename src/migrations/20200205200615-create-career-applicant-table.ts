import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CareerApplicants", {
      careerCode: {
        allowNull: false,
        primaryKey: true,
        type: DataType.INTEGER
      },
      applicantUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID
      },
      createdAt: {
        allowNull: false,
        type: DataType.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataType.DATE
      },
      deletedAt: {
        allowNull: true,
        type: DataType.DATE
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CareerApplicants");
  }
};
