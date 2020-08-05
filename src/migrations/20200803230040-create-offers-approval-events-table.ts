import { QueryInterface, UUID, DATE, ENUM } from "sequelize";
import { approvalStatuses } from "../models/ApprovalStatus";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(
      "OfferApprovalEvents",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID
        },
        adminUserUuid: {
          allowNull: false,
          references: { model: "Admins", key: "userUuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        offerUuid: {
          allowNull: false,
          references: { model: "Offers", key: "uuid" },
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
    queryInterface.dropTable("OfferApprovalEvents")
};
