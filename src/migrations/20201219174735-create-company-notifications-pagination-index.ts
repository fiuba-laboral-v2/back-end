import { QueryInterface } from "sequelize";

const tableName = "CompanyNotifications";
const indexName = "company_notifications_pagination_index";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "notifiedCompanyUuid" },
        { name: "isNew", order: "DESC" },
        { name: "createdAt", order: "DESC" },
        { name: "uuid", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
