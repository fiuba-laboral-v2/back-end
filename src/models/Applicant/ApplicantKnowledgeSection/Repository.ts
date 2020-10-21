import { ApplicantKnowledgeSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export const ApplicantKnowledgeSectionRepository = {
  update: async (updateArguments: IUpdateProps) =>
    SectionRepository.update({ modelClass: ApplicantKnowledgeSection, ...updateArguments }),
  truncate: () => SectionRepository.truncate(ApplicantKnowledgeSection)
};
