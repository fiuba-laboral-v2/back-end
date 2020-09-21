import { ID, nonNull } from "$graphql/fieldTypes";
import { JobApplicationRepository } from "$models/JobApplication";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { CurrentUser } from "$models/CurrentUser";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminRepository } from "$models/Admin";

export const updateJobApplicationApprovalStatus = {
  type: GraphQLJobApplication,
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
    { uuid, approvalStatus }: IUpdateJobApplicationApprovalStatusArguments,
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdmin().adminUserUuid);
    return JobApplicationRepository.updateApprovalStatus({
      admin,
      uuid,
      status: approvalStatus
    });
  }
};

interface IUpdateJobApplicationApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
