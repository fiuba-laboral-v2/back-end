import { QueryInterface, UUID, DATE } from "sequelize";

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
        userUuid: {
          allowNull: false,
          references: { model: "Admins", key: "userUuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        companyUuid: {
          allowNull: false,
          references: { model: "Companies", key: "uuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        status: {
          allowNull: false,
          type: "approval_status",
          defaultValue: "pending"
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
