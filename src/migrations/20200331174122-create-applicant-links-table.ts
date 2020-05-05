import { DATE, UUID, QueryInterface, STRING } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
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
            onDelete: "CASCADE",
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
        },
        { transaction }
        );
      await queryInterface.addConstraint(
        "ApplicantsLinks",
        ["applicantUuid", "name"],
        {
          type: "unique",
          name: "ApplicantsLinks_applicantUuid_name_key",
          transaction
        }
      );
      await queryInterface.addConstraint(
        "ApplicantsLinks",
        ["applicantUuid", "url"],
        {
          type: "unique",
          name: "ApplicantsLinks_applicantUuid_url_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ApplicantsLinks");
  }
};
