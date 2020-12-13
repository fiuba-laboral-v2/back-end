import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(
      "CREATE TYPE company_notification_type AS ENUM ('newJobApplication', 'approvedOffer', 'rejectedOffer');"
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("DROP TYPE company_notification_type;")
};
