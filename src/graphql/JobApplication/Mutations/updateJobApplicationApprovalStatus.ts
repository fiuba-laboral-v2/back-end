import { Database } from "$config/Database";
import { ID, nonNull } from "$graphql/fieldTypes";
import { JobApplicationRepository } from "$models/JobApplication";
import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

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
    { uuid, approvalStatus }: IMutationVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdmin().adminUserUuid;
    const jobApplication = await JobApplicationRepository.findByUuid(uuid);
    jobApplication.set({ approvalStatus });
    return Database.transaction(async transaction => {
      await JobApplicationRepository.save(jobApplication, transaction);
      await JobApplicationApprovalEventRepository.create({
        adminUserUuid,
        jobApplicationUuid: uuid,
        status: approvalStatus,
        transaction
      });
      return jobApplication;
    });
  }
};

interface IMutationVariables {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
