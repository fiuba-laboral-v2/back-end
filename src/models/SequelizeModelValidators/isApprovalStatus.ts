import { approvalStatuses } from "$models/ApprovalStatus";

export const isApprovalStatus = {
  validate: {
    isIn: {
      msg: `ApprovalStatus must be one of these values: ${approvalStatuses}`,
      args: [approvalStatuses],
    },
  },
};
