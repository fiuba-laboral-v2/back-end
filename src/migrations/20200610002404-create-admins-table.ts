import { DATE, UUID, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(
      "Admins",
      {
        uuid: {
          allowNull: false,
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
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.dropTable("Admins")
};
