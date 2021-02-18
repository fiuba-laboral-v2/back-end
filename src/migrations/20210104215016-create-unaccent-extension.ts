import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("CREATE EXTENSION IF NOT EXISTS unaccent"),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("DROP EXTENSION unaccent")
};
