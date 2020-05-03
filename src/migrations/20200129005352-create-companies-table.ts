import { UUID, DATE, STRING, TEXT, QueryInterface } from "sequelize";
import uuid from "uuid/v4";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Companies",
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID,
            defaultValue: uuid()
          },
          cuit: {
            allowNull: false,
            type: STRING
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
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Companies",
        ["cuit"],
        {
          type: "unique",
          name: "Companies_cuit_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Companies");
  }
};
