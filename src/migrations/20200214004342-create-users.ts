import { DATE, UUID, QueryInterface, STRING } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Users", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        defaultValue: uuid()
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
