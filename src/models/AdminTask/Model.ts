import { Applicant, Company, Offer, JobApplication } from "$models";

export const TABLE_NAME_COLUMN = "tableNameColumn";
export type AdminTaskModelsType =
  | typeof Applicant
  | typeof Company
  | typeof Offer
  | typeof JobApplication;
export const ADMIN_TASK_MODELS = [Applicant, Company, Offer, JobApplication];
export type AdminTask = Applicant | Company | Offer;
export enum AdminTaskType {
  Applicant = "Applicant",
  Company = "Company",
  Offer = "Offer",
  JobApplication = "JobApplication"
}
export const SharedApprovalAdminTaskTypes = [AdminTaskType.Company, AdminTaskType.Applicant];
export const SeparateApprovalAdminTaskTypes = [AdminTaskType.Offer, AdminTaskType.JobApplication];
