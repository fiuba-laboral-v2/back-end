import { String, List } from "$graphql/fieldTypes";
import { GraphQLApplicantType } from "$graphql/Applicant/Types/GraphQLApplicantType";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { ApplicantRepository, IFindLatest } from "$models/Applicant";
import { GraphQLPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getApplicants = {
  type: GraphQLPaginatedResults(GraphQLApplicant),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    name: {
      type: String
    },
    careerCodes: {
      type: List(String)
    },
    applicantType: {
      type: GraphQLApplicantType
    }
  },
  resolve: (_: undefined, filter: IFindLatest) => ApplicantRepository.findLatest(filter)
};
