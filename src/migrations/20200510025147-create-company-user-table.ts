import { DATE, QueryInterface, UUID } from "sequelize";

const TABLE_NAME = "CompanyUsers";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
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
          userUuid: {
            allowNull: false,
            references: { model: "Users", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
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
      await queryInterface.addConstraint(TABLE_NAME, ["companyUuid", "userUuid"], {
        type: "unique",
        name: "CompanyUsers_companyUuid_userUuid_unique",
        transaction
      });
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
