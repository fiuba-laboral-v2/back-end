import { approvalStatuses } from "../ApprovalStatus";

export const isApprovalStatus = {
  validate: {
    isIn: {
      msg: `ApprovalStatus must be one of these values: ${approvalStatuses}`,
      args: [approvalStatuses]
    }
  }
};
