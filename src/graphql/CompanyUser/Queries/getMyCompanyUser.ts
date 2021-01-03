import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { IApolloServerContext } from "$graphql/Context";
import { CompanyUserRepository } from "$models/CompanyUser";

export const getMyCompanyUser = {
  type: GraphQLCompanyUser,
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) =>
    CompanyUserRepository.findByUserUuid(currentUser.uuid)
};
