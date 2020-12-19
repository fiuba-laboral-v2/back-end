import { QueryInterface } from "sequelize";

const tableName = "Companies";
const indexName = "companies_updated_at_uuid";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "updatedAt", order: "DESC" },
        { name: "uuid", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
