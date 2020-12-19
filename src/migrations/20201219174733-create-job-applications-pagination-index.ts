import { QueryInterface } from "sequelize";

const tableName = "JobApplications";
const indexName = "job_applications_updated_at_uuid";

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
