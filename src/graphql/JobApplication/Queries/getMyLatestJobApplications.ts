import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$models/JobApplication";
import { ICompanyUser } from "$graphql/Context";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

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
    { currentUser }: { currentUser: ICompanyUser }
  ) =>
    JobApplicationRepository.findLatestByCompanyUuid({
      companyUuid: currentUser.company.uuid,
      updatedBeforeThan
    })
};
