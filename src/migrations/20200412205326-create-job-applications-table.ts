import { DATE, QueryInterface, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "JobApplications",
        {
          offerUuid: {
            allowNull: false,
            references: { model: "Offers", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          applicantUuid: {
            allowNull: false,
            references: { model: "Applicants", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
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
        "JobApplications",
        [ "applicantUuid", "offerUuid" ],
        {
          type: "primary key",
          name: "JobApplications_applicantUuid_offerUuid_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("JobApplications");
  }
};
