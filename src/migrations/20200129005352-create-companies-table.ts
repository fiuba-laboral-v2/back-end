import { DATE, INTEGER, QueryInterface, STRING, TEXT } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Companies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER
      },
      cuit: {
        allowNull: false,
        type: STRING,
        unique: true
      },
      companyName: {
        allowNull: false,
        type: STRING
      },
      slogan: {
        type: STRING
      },
      description: {
        type: STRING
      },
      logo: {
        type: TEXT
      },
      website: {
        type: STRING
      },
      email: {
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
    return queryInterface.dropTable("Companies");
  }
};
