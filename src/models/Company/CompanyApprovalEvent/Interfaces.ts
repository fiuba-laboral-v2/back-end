import { Transaction } from "sequelize";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ICreateCompanyApprovalEvent {
  adminUserUuid: string;
  company: Company;
  status: ApprovalStatus;
  transaction?: Transaction;
}
