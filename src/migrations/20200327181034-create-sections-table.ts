import { DATE, UUID, QueryInterface, TEXT } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Sections", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        defaultValue: uuid()
      },
      applicantUuid: {
        allowNull: false,
        references: { model: "Applicants", key: "uuid" },
        type: UUID
      },
      title: {
        allowNull: false,
        type: TEXT,
        unique: true
      },
      description: {
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
    return queryInterface.dropTable("Sections");
  }
};
