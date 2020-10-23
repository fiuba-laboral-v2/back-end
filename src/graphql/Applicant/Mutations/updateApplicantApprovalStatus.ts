import { ID, nonNull } from "$graphql/fieldTypes";
import { ApplicantRepository } from "$models/Applicant";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

export const updateApplicantApprovalStatus = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    }
  },
  resolve: async (
    _: undefined,
    { uuid, approvalStatus }: IUpdateApplicantApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) =>
    ApplicantRepository.updateApprovalStatus(
      currentUser.getAdmin().adminUserUuid,
      uuid,
      approvalStatus
    )
};

interface IUpdateApplicantApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
