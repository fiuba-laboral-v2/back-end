import { ENUM, QueryInterface } from "sequelize";
import { approvalStatuses, ApprovalStatus } from "../models/ApprovalStatus";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addColumn(
      "Applicants",
      "approvalStatus",
      {
        allowNull: false,
        type: ENUM<string>({ values: approvalStatuses }),
        defaultValue: ApprovalStatus.pending
      }
    ),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeColumn("Applicants", "approvalStatus")
};
