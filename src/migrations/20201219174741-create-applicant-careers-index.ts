import { QueryInterface } from "sequelize";

const tableName = "ApplicantCareers";
const indexName = "applicant_careers_index";

export = {
  up: (queryInterface: any) =>
    queryInterface.addIndex(tableName, {
      name: indexName,
      fields: [
        { name: "applicantUuid", order: "DESC" },
        { name: "isGraduate", order: "DESC" }
      ]
    }),
  down: (queryInterface: QueryInterface) => queryInterface.removeIndex(tableName, indexName)
};
