import { DATE, UUID, TEXT, BOOLEAN, QueryInterface } from "sequelize";

const TABLE_NAME = "CompanyNotifications";

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
          moderatorUuid: {
            allowNull: false,
            references: { model: "Admins", key: "userUuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          moderatorMessage: {
            allowNull: true,
            type: TEXT
          },
          type: {
            allowNull: false,
            type: "company_notification_type"
          },
          notifiedCompanyUuid: {
            allowNull: false,
            references: { model: "Companies", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          isNew: {
            allowNull: false,
            type: BOOLEAN,
            defaultValue: true
          },
          jobApplicationUuid: {
            allowNull: true,
            references: { model: "JobApplications", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          offerUuid: {
            allowNull: true,
            references: { model: "Offers", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          createdAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addIndex(TABLE_NAME, ["notifiedCompanyUuid", "isNew"], {
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
