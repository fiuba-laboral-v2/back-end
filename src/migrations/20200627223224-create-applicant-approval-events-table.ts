import { QueryInterface, UUID, DATE, ENUM } from "sequelize";
import { approvalStatuses } from "../models/ApprovalStatus";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(
      "ApplicantApprovalEvents",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID
        },
        userUuid: {
          allowNull: false,
          references: { model: "Admins", key: "userUuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        applicantUuid: {
          allowNull: false,
          references: { model: "Applicants", key: "uuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        status: {
          allowNull: false,
          type: ENUM<string>({ values: approvalStatuses })
        },
        createdAt: {
          allowNull: false,
          type: DATE
        },
        updatedAt: {
          allowNull: false,
          type: DATE
        }
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.dropTable("ApplicantApprovalEvents")
};
