import { QueryInterface, UUID, DATE, TEXT } from "sequelize";

const TABLE_NAME = "ApplicantApprovalEvents";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
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
      applicantUuid: {
        allowNull: false,
        references: { model: "Applicants", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      moderatorMessage: {
        allowNull: true,
        type: TEXT
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
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
