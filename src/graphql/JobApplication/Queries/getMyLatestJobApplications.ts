import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$models/JobApplication";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

export const getMyLatestJobApplications = {
  type: GraphQLPaginatedResults(GraphQLJobApplication),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (
    _: undefined,
    { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput },
    { currentUser }: IApolloServerContext
  ) =>
    JobApplicationRepository.findLatestByCompanyUuid({
      companyUuid: currentUser.getCompanyRole().companyUuid,
      updatedBeforeThan,
      approvalStatus: ApprovalStatus.approved
    })
};
