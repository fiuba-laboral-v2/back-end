import { DATE, UUID, QueryInterface, TEXT, INTEGER } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Sections",
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID,
          },
          applicantUuid: {
            allowNull: false,
            references: { model: "Applicants", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID,
          },
          title: {
            allowNull: false,
            type: TEXT,
          },
          text: {
            allowNull: false,
            type: TEXT,
          },
          displayOrder: {
            allowNull: false,
            autoIncrement: true,
            type: INTEGER,
          },
          createdAt: {
            allowNull: false,
            type: DATE,
          },
          updatedAt: {
            allowNull: false,
            type: DATE,
          },
        },
        { transaction }
      );

      await queryInterface.addConstraint("Sections", ["applicantUuid", "displayOrder"], {
        type: "unique",
        name: "Sections_applicantUuid_displayOrder_key",
        transaction,
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Sections");
  },
};
