import { Applicant, ApplicantKnowledgeSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export const ApplicantKnowledgeSectionRepository = {
  update: async ({ applicant, ...updateArguments }: IUpdateProps & { applicant: Applicant }) =>
    SectionRepository.update<ApplicantKnowledgeSection, Applicant>({
      modelClass: ApplicantKnowledgeSection,
      entityUuidKey: "applicantUuid",
      entity: applicant,
      ...updateArguments
    }),
  truncate: () => SectionRepository.truncate(ApplicantKnowledgeSection)
};
