import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        "CREATE EXTENSION citext",
        { transaction }
      );
      await queryInterface.createTable(
        "Capabilities",
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: DataType.UUID
          },
          description: {
            allowNull: false,
            type: DataType.CITEXT
          },
          createdAt: {
            allowNull: false,
            type: DataType.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataType.DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Capabilities",
        ["description"],
        {
          type: "unique",
          name: "Capabilities_description_key",
          transaction
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable("Capabilities", { transaction });
      await queryInterface.sequelize.query("DROP EXTENSION citext", { transaction });
    });
  }
};
