import { Applicant } from "../Applicant";
import { Company } from "../Company";

export const TABLE_NAME_COLUMN = "tableNameColumn";
export type ApprovableModelsType = typeof Applicant | typeof Company;
export const APPROVABLE_MODELS = [
  Company,
  Applicant
];
export type Approvable = Applicant | Company;
export enum ApprovableEntityType {
  Applicant = "Applicant",
  Company = "Company"
}
