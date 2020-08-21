import { QueryInterface, UUID, DATE } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable("JobApplicationApprovalEvent", {
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
  down: (queryInterface: QueryInterface) => queryInterface.dropTable("JobApplicationApprovalEvent")
};
