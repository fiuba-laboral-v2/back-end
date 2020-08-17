import { QueryInterface, DATE, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "JobApplications",
        {
          offerUuid: {
            allowNull: false,
            references: { model: "Offers", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          applicantUuid: {
            allowNull: false,
            references: { model: "Applicants", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          extensionApprovalStatus: {
            allowNull: false,
            type: "approval_status",
            defaultValue: "pending"
          },
          graduadosApprovalStatus: {
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
        },
        { transaction }
      );
      await queryInterface.addConstraint("JobApplications", ["applicantUuid", "offerUuid"], {
        type: "primary key",
        name: "JobApplications_applicantUuid_offerUuid_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable("JobApplications")
};
