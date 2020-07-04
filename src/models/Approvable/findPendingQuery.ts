import { findApprovableQuery } from "./findApprovableQuery";
import { IApprovableFilterOptions } from "./Interfaces";
import { ApprovalStatus } from "../ApprovalStatus";

export const findPendingQuery = ({ approvableEntityTypes }: IApprovableFilterOptions) => {
  return `
    WITH "Approvable" AS (${findApprovableQuery({ approvableEntityTypes })})
    SELECT * FROM "Approvable"
    WHERE "Approvable"."approvalStatus" = '${ApprovalStatus.pending}'
    ORDER BY "Approvable"."updatedAt" DESC
  `;
};
