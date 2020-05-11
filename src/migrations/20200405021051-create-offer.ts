import { QueryInterface, DATE, UUID, TEXT, INTEGER } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable(
      "Offers",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID
        },
        companyUuid: {
          allowNull: false,
          references: { model: "Companies", key: "uuid" },
          onDelete: "CASCADE",
          type: UUID
        },
        title: {
          allowNull: false,
          type: TEXT
        },
        description: {
          allowNull: false,
          type: TEXT
        },
        hoursPerDay: {
          allowNull: false,
          type: INTEGER
        },
        minimumSalary: {
          allowNull: false,
          type: INTEGER
        },
        maximumSalary: {
          allowNull: false,
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
      }
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Offers");
  }
};
