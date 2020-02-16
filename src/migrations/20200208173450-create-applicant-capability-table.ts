import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ApplicantsCapabilities", {
      applicantUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID,
        references: { model: "Applicants", key: "uuid" }
      },
      capabilityUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID,
        references: { model: "Capabilities", key: "uuid" }
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
    return queryInterface.dropTable("ApplicantCapabilities");
  }
};
