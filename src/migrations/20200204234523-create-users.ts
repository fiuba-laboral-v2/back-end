import { DATE, QueryInterface, STRING, TEXT, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Users", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      email: {
        allowNull: false,
        type: STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: STRING
      },
      name: {
        allowNull: false,
        type: TEXT
      },
      surname: {
        allowNull: false,
        type: TEXT
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
