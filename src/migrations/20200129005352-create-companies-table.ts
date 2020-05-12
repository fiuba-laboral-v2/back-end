import { UUID, DATE, STRING, TEXT, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Companies",
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
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
            type: TEXT
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
