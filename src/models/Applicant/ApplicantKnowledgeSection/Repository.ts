import { Applicant, ApplicantKnowledgeSection } from "$models";
import { SectionRepository } from "$models/Applicant/Section";
import { ISection } from "../Interface";
import { Transaction } from "sequelize";

export const ApplicantKnowledgeSectionRepository = {
  update: async (sections: ISection[], applicant: Applicant, transaction?: Transaction) =>
    SectionRepository.update({
      modelClass: ApplicantKnowledgeSection,
      sections,
      applicant,
      transaction
    }),
  truncate: () => SectionRepository.truncate(ApplicantKnowledgeSection)
};
