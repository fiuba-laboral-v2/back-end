import { QueryInterface, UUID, DATE, ENUM } from "sequelize";
import { approvalStatuses } from "../models/ApprovalStatus";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(
      "CompanyApprovalEvents",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID
        },
        adminUuid: {
          allowNull: false,
          references: { model: "Users", key: "uuid" },
          type: UUID
        },
        companyUuid: {
          allowNull: false,
          references: { model: "Companies", key: "uuid" },
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
    queryInterface.dropTable("CompanyApprovalEvents")
};
