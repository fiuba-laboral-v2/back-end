import { Transaction } from "sequelize";
import { Company } from "../..";
import { ApprovalStatus } from "../../ApprovalStatus";

export interface ICreateCompanyApprovalEvent {
  adminUserUuid: string;
  company: Company;
  status: ApprovalStatus;
  transaction?: Transaction;
}
