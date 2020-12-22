import { QueryInterface } from "sequelize";

const TYPE_NAME = "admin_notification_type";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`
      CREATE TYPE ${TYPE_NAME} AS ENUM (
        'updatedCompanyProfile'
      );
    `),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`DROP TYPE ${TYPE_NAME};`)
};
