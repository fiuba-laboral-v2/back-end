import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { ApplicantRepository } from "$models/Applicant";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

const getApplicants = {
  type: GraphQLPaginatedResults(GraphQLApplicant),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    ApplicantRepository.findLatest({ updatedBeforeThan })
};

export { getApplicants };
