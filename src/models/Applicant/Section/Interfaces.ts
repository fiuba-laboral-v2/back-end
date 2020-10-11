import { ISection } from "$models/Applicant";
import { Applicant, ApplicantExperienceSection, ApplicantKnowledgeSection } from "$models";
import { Transaction } from "sequelize";

export type SectionType = typeof ApplicantExperienceSection | typeof ApplicantKnowledgeSection;

export interface IUpdate {
  modelClass: SectionType;
  sections: ISection[];
  applicant: Applicant;
  transaction?: Transaction;
}
