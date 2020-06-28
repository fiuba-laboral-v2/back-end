import { Transaction } from "sequelize";
import { ApprovalStatus } from "../../ApprovalStatus";

export interface ICreateApplicantApprovalEvent {
  adminUserUuid: string;
  applicantUuid: string;
  status: ApprovalStatus;
  transaction?: Transaction;
}
