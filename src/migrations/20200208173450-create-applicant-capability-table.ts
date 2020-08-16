import { DATE, QueryInterface, UUID } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ApplicantsCapabilities", {
      applicantUuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        references: { model: "Applicants", key: "uuid" },
        onDelete: "CASCADE",
      },
      capabilityUuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        references: { model: "Capabilities", key: "uuid" },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DATE,
      },
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ApplicantsCapabilities");
  },
};
