import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";
import { CompanyUserRepository } from "$models/CompanyUser";

export const getCompanyUsers = {
  type: GraphQLPaginatedResults(GraphQLCompanyUser),
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
    CompanyUserRepository.findLatestByCompany({
      updatedBeforeThan,
      companyUuid: currentUser.getCompanyRole().companyUuid
    })
};
