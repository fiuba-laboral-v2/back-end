import { DATE, QueryInterface, TEXT } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Careers",
        {
          code: {
            allowNull: false,
            type: TEXT
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
        },
        { transaction }
      );
      await queryInterface.addConstraint("Careers", ["code"], {
        type: "primary key",
        name: "Careers_code_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Careers");
  }
};
