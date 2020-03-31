import { DATE, UUID, QueryInterface, TEXT, INTEGER } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(
      "Sections",
      {
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
        text: {
          allowNull: false,
          type: TEXT
        },
        displayOrder: {
          allowNull: false,
          autoIncrement: true,
          type: INTEGER
        },
        createdAt: {
          allowNull: false,
          type: DATE
        },
        updatedAt: {
          allowNull: false,
          type: DATE
        }
      },
      {
        uniqueKeys: {
          actions_unique: {
            fields: ["applicantUuid", "displayOrder"]
          }
        }
      }
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Sections");
  }
};
