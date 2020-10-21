import { Applicant, ApplicantExperienceSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export const ApplicantExperienceSectionRepository = {
  update: async (updateArguments: IUpdateProps) =>
    SectionRepository.update({ modelClass: ApplicantExperienceSection, ...updateArguments }),
  findByApplicant: (applicant: Applicant) =>
    SectionRepository.findByApplicant(applicant, ApplicantExperienceSection),
  truncate: () => SectionRepository.truncate(ApplicantExperienceSection)
};
