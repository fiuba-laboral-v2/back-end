import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "CompanyPhoneNumbers",
        {
          phoneNumber: {
            allowNull: false,
            type: DataType.STRING
          },
          companyUuid: {
            allowNull: false,
            type: DataType.UUID,
            references: { model: "Companies", key: "uuid" },
            onDelete: "CASCADE"
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
        "CompanyPhoneNumbers",
        ["phoneNumber", "companyUuid"],
        {
          type: "primary key",
          name: "companyUuid_phoneNumber_companyUuid_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CompanyPhoneNumbers");
  }
};
