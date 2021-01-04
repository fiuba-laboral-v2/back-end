import { DATE, QueryInterface, UUID } from "sequelize";

const TABLE_NAME = "JobApplications";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
          },
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
          approvalStatus: {
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
      await queryInterface.addConstraint(TABLE_NAME, ["applicantUuid", "offerUuid"], {
        type: "unique",
        name: "JobApplications_applicantUuid_offerUuid_unique",
        transaction
      });
      await queryInterface.addIndex(TABLE_NAME, ["approvalStatus", "updatedAt", "uuid"], {
        transaction
      });
      await queryInterface.addIndex(TABLE_NAME, ["updatedAt", "uuid"], {
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
