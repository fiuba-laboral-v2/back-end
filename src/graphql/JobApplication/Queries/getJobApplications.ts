import { String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository, IFindLatest } from "$src/models/JobApplication";
import { GraphQLPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getJobApplications = {
  type: GraphQLPaginatedResults(GraphQLJobApplication),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    companyName: {
      type: String
    },
    applicantName: {
      type: String
    },
    offerTitle: {
      type: String
    }
  },
  resolve: (_: undefined, filter: IFindLatest) => JobApplicationRepository.findLatest(filter)
};
