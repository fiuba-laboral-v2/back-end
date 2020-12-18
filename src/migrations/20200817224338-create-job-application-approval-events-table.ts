import { QueryInterface, UUID, DATE, TEXT } from "sequelize";

const TABLE_NAME = "JobApplicationApprovalEvents";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      jobApplicationUuid: {
        allowNull: false,
        references: { model: "JobApplications", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      adminUserUuid: {
        allowNull: false,
        references: { model: "Admins", key: "userUuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      moderatorMessage: {
        allowNull: true,
        type: TEXT
      },
      status: {
        allowNull: false,
        type: "approval_status"
      },
      createdAt: {
        allowNull: false,
        type: DATE
      },
      updatedAt: {
        allowNull: false,
        type: DATE
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
