import { DATE, UUID, TEXT, BOOLEAN, STRING, QueryInterface } from "sequelize";

const TABLE_NAME = "NotificationEmailLogs";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      notificationUuid: {
        allowNull: false,
        type: UUID
      },
      notificationTable: {
        allowNull: true,
        type: STRING(22)
      },
      success: {
        allowNull: true,
        type: BOOLEAN
      },
      message: {
        allowNull: true,
        type: TEXT
      },
      createdAt: {
        allowNull: false,
        type: DATE
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
