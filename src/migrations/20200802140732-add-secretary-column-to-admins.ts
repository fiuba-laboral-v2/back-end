import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      "CREATE TYPE secretary AS ENUM ('graduados', 'extension');"
    );
    return queryInterface.addColumn(
      "Admins",
      "secretary",
      {
        allowNull: false,
        type: "secretary",
        defaultValue: "extension"
      }
    );
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS secretary;");
    return queryInterface.removeColumn("Admins", "secretary");
  }
};
