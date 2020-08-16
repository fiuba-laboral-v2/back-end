import { QueryInterface } from "sequelize";

const tableName = "Applicants";
const indexName = "applicants_uuid_updated_at";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "uuid", order: "DESC" },
        { name: "updatedAt", order: "DESC" },
      ],
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName),
};
