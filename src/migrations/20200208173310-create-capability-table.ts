import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Capabilities", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: uuid()
      },
      description: {
        allowNull: false,
        type: DataType.TEXT
      },
      createdAt: {
        allowNull: false,
        type: DataType.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataType.DATE
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Capabilities");
  }
};
