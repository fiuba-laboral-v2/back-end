import { Transaction } from "sequelize";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ICreateJobApplicationApprovalEvent {
  jobApplicationUuid: string;
  adminUserUuid: string;
  status: ApprovalStatus;
  transaction?: Transaction;
}
