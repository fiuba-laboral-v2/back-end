import { Applicant, Company, Offer } from "..";

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
