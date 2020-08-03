import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => (
    await queryInterface.sequelize.query(
      "CREATE TYPE secretary AS ENUM ('graduados', 'extension');"
    )),
  down: async (queryInterface: QueryInterface) => (
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS secretary;")
  )
};
