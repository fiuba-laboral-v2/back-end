import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$src/models/JobApplication";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getJobApplications = {
  type: GraphQLPaginatedResults(GraphQLJobApplication),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    JobApplicationRepository.findLatest(updatedBeforeThan)
};
