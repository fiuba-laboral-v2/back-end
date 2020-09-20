import { ID, nonNull } from "$graphql/fieldTypes";
import { ApplicantRepository } from "$models/Applicant";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { CurrentUser } from "$models/CurrentUser";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    { currentUser }: { currentUser: CurrentUser }
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
