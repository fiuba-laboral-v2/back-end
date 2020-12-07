import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(
      "CREATE TYPE applicant_notification_type AS ENUM ('approvedJobApplication');"
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("DROP TYPE applicant_notification_type;")
};
