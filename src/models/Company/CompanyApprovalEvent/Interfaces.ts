import { Transaction } from "sequelize";
import { Admin } from "../../Admin";
import { Company } from "../Model";
import { ApprovalStatus } from "../../ApprovalStatus";

export interface ICreateCompanyApprovalEvent {
  admin: Admin;
  company: Company;
  status: ApprovalStatus;
  transaction?: Transaction;
}
