import { DATE, INTEGER, QueryInterface, TEXT, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Applicants", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      userUuid: {
        allowNull: false,
        references: { model: "Users", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      padron: {
        allowNull: false,
        type: INTEGER
      },
      description: {
        allowNull: true,
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
    return queryInterface.dropTable("Applicants");
  }
};
