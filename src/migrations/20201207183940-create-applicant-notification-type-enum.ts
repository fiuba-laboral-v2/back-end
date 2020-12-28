import { QueryInterface } from "sequelize";

const TYPE_NAME = "applicant_notification_type";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`
      CREATE TYPE ${TYPE_NAME} AS ENUM (
        'approvedJobApplication',
        'rejectedJobApplication',
        'pendingJobApplication',
        'approvedProfile',
        'rejectedProfile'
      );
    `),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(`DROP TYPE ${TYPE_NAME};`)
};
