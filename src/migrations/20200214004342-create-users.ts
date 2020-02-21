import { DATE, QueryInterface, STRING } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Users", {
      email: {
        allowNull: false,
        primaryKey: true,
        type: STRING
      },

      password: {
        allowNull: false,
        type: STRING
      },

      createdAt: {
        allowNull: false,
        type: DATE
      },

      updatedAt: {
        allowNull: false,
        type: DATE
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Users");
  }
};
