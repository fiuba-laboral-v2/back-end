import { CITEXT, QueryInterface, TEXT } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        "CREATE EXTENSION citext",
        { transaction }
      );
      await queryInterface.changeColumn(
        "Capabilities",
        "description",
        {
          type: CITEXT,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Capabilities",
        [ "description" ],
        {
          type: "unique",
          name: "Capabilities_description_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "Capabilities",
      "description",
      {
        type: TEXT,
        allowNull: false
      }
    );
  }
};
