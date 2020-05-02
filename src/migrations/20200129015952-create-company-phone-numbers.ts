import { DATE, INTEGER, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CompanyPhoneNumbers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER
      },
      phoneNumber: {
        type: INTEGER
      },
      companyId: {
        type: INTEGER,
        references: { model: "Companies", key: "id" }
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
    return queryInterface.dropTable("CompanyPhoneNumbers");
  }
};
