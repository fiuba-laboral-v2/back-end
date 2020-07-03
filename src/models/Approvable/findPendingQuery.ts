import { findApprovableQuery } from "./findApprovableQuery";
import { ApprovalStatus } from "../ApprovalStatus";

export const findPendingQuery = () => {
  return `
    WITH "Approvable" AS (${findApprovableQuery()})
    SELECT * FROM "Approvable"
    WHERE "Approvable"."approvalStatus" = '${ApprovalStatus.pending}'
    ORDER BY "Approvable"."updatedAt" DESC
  `;
};
