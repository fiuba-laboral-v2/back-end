import { List, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "../Types/GraphQLApplicantCareerInput";
import { GraphQLApplicantKnowledgeSectionInputType } from "../Types/ApplicantKnowledgeSection";
import { GraphQLApplicantExperienceSectionInputType } from "../Types/ApplicantExperienceSection";
import { GraphQLUserUpdateInput } from "$graphql/User/Types/GraphQLUserUpdateInput";
import { ApplicantRepository, IApplicantEditable } from "$models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";
import { IApolloServerContext } from "$graphql/Context";
import { Database } from "$config";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { ApplicantKnowledgeSectionRepository } from "$models/Applicant/ApplicantKnowledgeSection";
import { ApplicantExperienceSectionRepository } from "$models/Applicant/ApplicantExperienceSection";
import { ApplicantLinkRepository } from "$models/Applicant/Link";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { ApplicantCapabilityRepository } from "$models/ApplicantCapability";

export const updateCurrentApplicant = {
  type: GraphQLApplicant,
  args: {
    user: {
      type: GraphQLUserUpdateInput
    },
    description: {
      type: String
    },
    careers: {
      type: List(GraphQLApplicantCareerInput)
    },
    capabilities: {
      type: List(String)
    },
    knowledgeSections: {
      type: List(GraphQLApplicantKnowledgeSectionInputType)
    },
    experienceSections: {
      type: List(GraphQLApplicantExperienceSectionInputType)
    },
    links: {
      type: List(GraphQLLinkInput)
    }
  },
  resolve: async (
    _: undefined,
    {
      user: userAttributes = {},
      description,
      knowledgeSections = [],
      experienceSections = [],
      links = [],
      capabilities: newCapabilities = [],
      careers = []
    }: IApplicantEditable,
    { currentUser }: IApolloServerContext
  ) => {
    const { applicantUuid } = currentUser.getApplicantRole();
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    await applicant.set({ description });
    if (applicant.isRejected()) await applicant.set({ approvalStatus: ApprovalStatus.pending });
    const user = await UserRepository.findByUuid(applicant.userUuid);
    user.setAttributes(userAttributes);

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      await new ApplicantKnowledgeSectionRepository().update({
        sections: knowledgeSections,
        applicant,
        transaction
      });
      await new ApplicantExperienceSectionRepository().update({
        sections: experienceSections,
        applicant,
        transaction
      });
      await ApplicantLinkRepository.update(links, applicant, transaction);
      await ApplicantCareersRepository.update(careers, applicant, transaction);
      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);
      await applicant.save({ transaction });
      return applicant;
    });
  }
};
