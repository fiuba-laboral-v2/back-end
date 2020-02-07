import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Careers", {
      code: {
        allowNull: false,
        primaryKey: true,
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
      },
      deletedAt: {
        allowNull: true,
        type: DataType.DATE
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Careers");
  }
};
