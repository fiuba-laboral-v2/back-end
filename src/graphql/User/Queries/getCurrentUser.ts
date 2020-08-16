import { GraphQLUser } from "../Types/GraphQLUser";
import { IApolloServerContext } from "$graphql/Context";
import { UserRepository } from "$models/User";

export const getCurrentUser = {
  type: GraphQLUser,
  resolve: (_: undefined, __: object, { currentUser }: IApolloServerContext) =>
    currentUser && UserRepository.findByEmail(currentUser.email),
};
