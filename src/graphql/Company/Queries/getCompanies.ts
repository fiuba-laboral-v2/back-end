import { String } from "../../fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { CompanyRepository, IFindLatest } from "$models/Company";
import { GraphQLPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getCompanies = {
  type: GraphQLPaginatedResults(GraphQLCompany),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    companyName: {
      type: String
    },
    businessSector: {
      type: String
    }
  },
  resolve: (_: undefined, filter: IFindLatest) => CompanyRepository.findLatest(filter)
};
