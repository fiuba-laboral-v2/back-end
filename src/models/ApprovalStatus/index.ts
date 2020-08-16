export enum ApprovalStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export const approvalStatuses = Object.keys(ApprovalStatus);
