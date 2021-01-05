import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("CREATE EXTENSION unaccent"),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.query("DROP EXTENSION unaccent")
};
