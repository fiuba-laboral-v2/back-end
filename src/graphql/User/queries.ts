import { GraphQLUser } from "./Types/GraphQLUser";
import { IApolloServerContext } from "../../graphqlContext";
import { UserRepository } from "../../models/User/Repository";

export const userQueries = {
  me: {
    type: GraphQLUser,
    resolve: (_: undefined, __: object, { currentUser }: IApolloServerContext) =>
      UserRepository.findByEmail(currentUser.email)
  }
};
