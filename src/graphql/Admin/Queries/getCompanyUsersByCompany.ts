import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLCompanyUser } from "../../CompanyUser/Types/GraphQLCompanyUser";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { CompanyUserRepository } from "$models/CompanyUser";

export const getCompanyUsersByCompany = {
  type: GraphQLPaginatedResults(GraphQLCompanyUser),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    companyUuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { companyUuid, updatedBeforeThan }: IGetUsersByCompany) =>
    CompanyUserRepository.findLatestByCompany({ updatedBeforeThan, companyUuid })
};

export interface IGetUsersByCompany {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
