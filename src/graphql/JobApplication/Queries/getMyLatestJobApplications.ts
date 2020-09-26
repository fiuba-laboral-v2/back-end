import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$models/JobApplication";
import { CurrentUser } from "$models/CurrentUser";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    { currentUser }: { currentUser: CurrentUser }
  ) =>
    JobApplicationRepository.findLatestByCompanyUuid({
      companyUuid: currentUser.getCompany().companyUuid,
      updatedBeforeThan,
      approvalStatus: ApprovalStatus.approved
    })
};
