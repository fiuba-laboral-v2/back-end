import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => (
    queryInterface.sequelize.query(
      "CREATE TYPE secretary AS ENUM ('graduados', 'extension');"
    )),
  down: (queryInterface: QueryInterface) => (
    queryInterface.sequelize.query("DROP TYPE IF EXISTS secretary;")
  )
};
