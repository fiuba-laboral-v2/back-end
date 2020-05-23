import { GraphQLUser } from "../Types/GraphQLUser";
import { IApolloServerContext } from "../../../graphqlContext";
import { UserRepository } from "../../../models/User";

export const getCurrentUser = {
  type: GraphQLUser,
  resolve: (_: undefined, __: object, { currentUser }: IApolloServerContext) =>
    currentUser && UserRepository.findByEmail(currentUser.email)
};
