import { Int, nonNull } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { ApplicantRepository } from "$models/Applicant";
import { IApolloServerContext } from "$graphql/Context";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const updatePadron = {
  type: GraphQLApplicant,
  args: {
    padron: {
      type: nonNull(Int)
    }
  },
  resolve: async (
    _: undefined,
    { padron }: IUpdatePadron,
    { currentUser }: IApolloServerContext
  ) => {
    const { applicantUuid } = currentUser.getApplicantRole();
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    applicant.set({ padron, approvalStatus: ApprovalStatus.pending });
    await ApplicantRepository.save(applicant);
    return applicant;
  }
};

interface IUpdatePadron {
  padron: number;
}
