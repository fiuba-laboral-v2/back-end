import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn(
      "Offers",
      "extensionApprovalStatus",
      {
        allowNull: false,
        type: "approval_status",
        defaultValue: "pending"
      }
    );

    return queryInterface.addColumn(
      "Offers",
      "graduadosApprovalStatus",
      {
        allowNull: false,
        type: "approval_status",
        defaultValue: "pending"
      }
    );
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Offers", "extensionApprovalStatus");
    return queryInterface.removeColumn("Offers", "graduadosApprovalStatus");
  }
};
