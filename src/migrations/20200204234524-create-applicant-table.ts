import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Applicants", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: uuid()
      },
      name: {
        allowNull: false,
        type: DataType.TEXT
      },
      surname: {
        allowNull: false,
        type: DataType.TEXT
      },
      padron: {
        allowNull: false,
        type: DataType.INTEGER
      },
      description: {
        allowNull: false,
        type: DataType.TEXT
      },
      credits: {
        allowNull: false,
        type: DataType.INTEGER
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
    return queryInterface.dropTable("Applicants");
  }
};
