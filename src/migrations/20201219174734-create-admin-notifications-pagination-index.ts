import { QueryInterface } from "sequelize";

const tableName = "AdminNotifications";
const indexName = "admin_notifications_pagination_index";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "secretary", order: "DESC" },
        { name: "isNew", order: "DESC" },
        { name: "createdAt", order: "DESC" },
        { name: "uuid", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
