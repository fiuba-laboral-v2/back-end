import { QueryInterface, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "CompanyUsers",
        {
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
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "CompanyUsers",
        ["companyUuid", "userUuid"],
        {
          type: "unique",
          name: "CompanyUsers_companyUuid_userUuid_key",
          transaction
        }
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.dropTable("CompanyUsers")
};
