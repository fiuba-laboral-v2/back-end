import { QueryInterface } from "sequelize";

const tableName = "Offers";
const indexName = "offers_uuid_updated_at";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(
      tableName,
      {
        name: indexName,
        fields: [{ name: "uuid", order: "DESC" }, { name: "updatedAt", order: "DESC" }]
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeIndex(tableName, indexName)
};
