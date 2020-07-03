import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Companies",
      "approvalStatus",
      {
        allowNull: false,
        type: "approval_status",
        defaultValue: "pending"
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn("Companies", "approvalStatus")
};
