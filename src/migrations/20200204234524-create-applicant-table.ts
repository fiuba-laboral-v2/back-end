import { QueryInterface, UUID } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Applicants", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataType.UUID
      },
      userUuid: {
        allowNull: false,
        references: { model: "Users", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      padron: {
        allowNull: false,
        type: DataType.INTEGER
      },
      description: {
        allowNull: true,
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
    return queryInterface.dropTable("Applicants");
  }
};
