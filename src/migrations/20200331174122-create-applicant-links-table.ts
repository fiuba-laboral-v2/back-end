import { DATE, UUID, QueryInterface, STRING } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(
      "ApplicantsLinks",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID,
          defaultValue: uuid()
        },
        applicantUuid: {
          allowNull: false,
          references: { model: "Applicants", key: "uuid" },
          type: UUID
        },
        name: {
          allowNull: false,
          type: STRING
        },
        url: {
          allowNull: false,
          type: STRING
        },
        createdAt: {
          allowNull: false,
          type: DATE
        },
        updatedAt: {
          allowNull: false,
          type: DATE
        }
      }
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ApplicantsLinks");
  }
};
