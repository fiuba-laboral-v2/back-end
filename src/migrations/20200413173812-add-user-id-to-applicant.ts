import { QueryInterface, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Applicants",
      "userUuid",
      {
        allowNull: false,
        references: { model: "Users", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn(
      "Applicants",
      "userUuid"
    )
};
