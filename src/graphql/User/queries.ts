import { GraphQLUser } from "./Types/GraphQLUser";
import { IApolloServerContext } from "../../server";
import { UserRepository } from "../../models/User/Repository";

export const userQueries = {
  me: {
    type: GraphQLUser,
    resolve: async (_: undefined, __: object, { currentUser }: IApolloServerContext) => {
      return UserRepository.findByEmail(currentUser!.email);
    }
  }
};
