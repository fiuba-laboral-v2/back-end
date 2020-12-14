import { QueryInterface } from "sequelize";

const TYPE_NAME = "company_notification_type";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`
      CREATE TYPE ${TYPE_NAME} AS ENUM (
        'newJobApplication',
        'approvedOffer',
        'rejectedOffer',
        'approvedProfile'
      );
    `),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`DROP TYPE ${TYPE_NAME};`)
};
