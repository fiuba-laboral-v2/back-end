import { Applicant, Company, Offer } from "$models";

export const TABLE_NAME_COLUMN = "tableNameColumn";
export type AdminTaskModelsType = typeof Applicant | typeof Company | typeof Offer;
export const ADMIN_TASK_MODELS = [
  Applicant,
  Company,
  Offer
];
export type AdminTask = Applicant | Company | Offer;
export enum AdminTaskType {
  Applicant = "Applicant",
  Company = "Company",
  Offer = "Offer"
}
export const SharedApprovalAdminTaskTypes = [AdminTaskType.Company, AdminTaskType.Applicant];
export const SeparateApprovalAdminTaskTypes = [AdminTaskType.Offer];
