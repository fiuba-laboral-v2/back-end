import { QueryInterface } from "sequelize";

const tableName = "Offers";
const indexName = "offers_admin_tasks_index";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "extensionApprovalStatus", order: "DESC" },
        { name: "graduadosApprovalStatus", order: "DESC" },
        { name: "updatedAt", order: "DESC" },
        { name: "uuid", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
