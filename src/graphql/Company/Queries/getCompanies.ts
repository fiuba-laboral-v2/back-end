import { GraphQLCompany } from "../Types/GraphQLCompany";
import { CompanyRepository } from "$models/Company";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getCompanies = {
  type: GraphQLPaginatedResults(GraphQLCompany),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    CompanyRepository.findLatest({ updatedBeforeThan })
};
