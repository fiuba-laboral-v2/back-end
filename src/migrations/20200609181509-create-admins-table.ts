import { DATE, UUID, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Admins",
        {
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
      await queryInterface.addConstraint(
        "Admins",
        ["userUuid"],
        {
          type: "primary key",
          name: "Admins_userUuid_key",
          transaction
        }
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.dropTable("Admins")
};
