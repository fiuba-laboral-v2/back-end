import { CITEXT, DATE, QueryInterface, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query("CREATE EXTENSION citext", {
        transaction
      });
      await queryInterface.createTable(
        "Capabilities",
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
          },
          description: {
            allowNull: false,
            type: CITEXT
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint("Capabilities", ["description"], {
        type: "unique",
        name: "Capabilities_description_key",
        transaction
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable("Capabilities", { transaction });
      await queryInterface.sequelize.query("DROP EXTENSION citext", {
        transaction
      });
    });
  }
};
