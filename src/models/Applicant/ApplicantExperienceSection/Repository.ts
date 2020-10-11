import { Applicant, ApplicantExperienceSection } from "$models";
import { SectionRepository } from "$models/Applicant/Section";
import { IUpdate } from "./Interfaces";

export const ApplicantExperienceSectionRepository = {
  update: async ({ sections, applicant, transaction }: IUpdate) =>
    SectionRepository.update({
      modelClass: ApplicantExperienceSection,
      sections,
      applicant,
      transaction
    }),
  findByApplicant: (applicant: Applicant) =>
    SectionRepository.findByApplicant(applicant, ApplicantExperienceSection),
  truncate: () => SectionRepository.truncate(ApplicantExperienceSection)
};
