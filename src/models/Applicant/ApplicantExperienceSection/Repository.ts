import { Applicant, ApplicantExperienceSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

const entityUuidKey = "applicantUuid";

export const ApplicantExperienceSectionRepository = {
  update: async ({ applicant, ...updateArguments }: IUpdateProps & { applicant: Applicant }) =>
    SectionRepository.update({
      modelClass: ApplicantExperienceSection,
      entity: applicant,
      entityUuidKey,
      ...updateArguments
    }),
  findByApplicant: (applicant: Applicant) =>
    SectionRepository.findByEntity({
      modelClass: ApplicantExperienceSection,
      entity: applicant,
      entityUuidKey
    }),
  truncate: () => SectionRepository.truncate(ApplicantExperienceSection)
};
