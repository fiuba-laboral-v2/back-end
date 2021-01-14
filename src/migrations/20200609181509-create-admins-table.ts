import { DATE, UUID, QueryInterface } from "sequelize";

const TABLE_NAME = "Admins";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          userUuid: {
            allowNull: false,
            references: { model: "Users", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          secretary: {
            allowNull: false,
            type: "secretary"
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          },
          deletedAt: {
            allowNull: true,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_NAME, ["userUuid"], {
        type: "primary key",
        name: "Admins_userUuid_key",
        transaction
      });
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
