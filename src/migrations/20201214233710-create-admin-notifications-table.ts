import { DATE, UUID, BOOLEAN, QueryInterface } from "sequelize";

const TABLE_NAME = "AdminNotifications";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      type: {
        allowNull: false,
        type: "admin_notification_type"
      },
      secretary: {
        allowNull: false,
        type: "secretary"
      },
      companyUuid: {
        allowNull: true,
        references: { model: "Companies", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      isNew: {
        allowNull: false,
        type: BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: DATE
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
