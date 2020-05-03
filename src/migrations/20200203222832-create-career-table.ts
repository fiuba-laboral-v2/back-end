import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Careers",
        {
          code: {
            allowNull: false,
            type: DataType.STRING
          },
          description: {
            allowNull: false,
            type: DataType.TEXT
          },
          credits: {
            allowNull: false,
            type: DataType.INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DataType.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataType.DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Careers",
        ["code"],
        {
          type: "primary key",
          name: "Careers_code_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Careers", { cascade: true });
  }
};
