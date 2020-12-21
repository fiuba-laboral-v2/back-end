import { DATE, QueryInterface, STRING, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "CompanyPhoneNumbers",
        {
          phoneNumber: {
            allowNull: false,
            type: STRING
          },
          companyUuid: {
            allowNull: false,
            type: UUID,
            references: { model: "Companies", key: "uuid" },
            onDelete: "CASCADE"
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
      await queryInterface.addConstraint("CompanyPhoneNumbers", ["phoneNumber", "companyUuid"], {
        type: "primary key",
        name: "CompanyPhoneNumbers_phoneNumber_companyUuid_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CompanyPhoneNumbers");
  }
};
