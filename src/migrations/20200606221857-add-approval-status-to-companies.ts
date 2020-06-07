import { ENUM, QueryInterface } from "sequelize";
import { approvalStatus, ApprovalStatus } from "../models/ApprovalStatus";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Companies",
      "approvalStatus",
      {
        allowNull: false,
        type: ENUM<string>({ values: approvalStatus }),
        defaultValue: ApprovalStatus.pending
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn("Companies", "approvalStatus")
};
