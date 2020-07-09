import { Applicant } from "..";
import { Company } from "..";

export const TABLE_NAME_COLUMN = "tableNameColumn";
export type ApprovableModelsType = typeof Applicant | typeof Company;
export const ADMIN_TASK_MODELS = [
  Applicant,
  Company
];
export type AdminTask = Applicant | Company;
export enum AdminTaskType {
  Applicant = "Applicant",
  Company = "Company"
}
