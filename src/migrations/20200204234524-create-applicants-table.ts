import { DATE, INTEGER, QueryInterface, TEXT, UUID } from "sequelize";

const TABLE_NAME = "Applicants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
          },
          userUuid: {
            allowNull: false,
            references: { model: "Users", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          padron: {
            allowNull: false,
            type: INTEGER
          },
          description: {
            allowNull: true,
            type: TEXT
          },
          approvalStatus: {
            allowNull: false,
            type: "approval_status",
            defaultValue: "pending"
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
      await queryInterface.addIndex(TABLE_NAME, ["approvalStatus", "updatedAt", "uuid"], {
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
