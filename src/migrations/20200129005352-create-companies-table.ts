import { UUID, DATE, STRING, TEXT, QueryInterface } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Companies", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        defaultValue: uuid()
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
