import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query(
      "CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');"
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("DROP TYPE approval_status;")
};
