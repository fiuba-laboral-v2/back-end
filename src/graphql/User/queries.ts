import { GraphQLUser } from "./Types/GraphQLUser";
import { IApolloServerContext } from "../../server";
import { UserRepository } from "../../models/User/Repository";
import { AuthenticationError } from "../Errors";

export const userQueries = {
  me: {
    type: GraphQLUser,
    resolve: async (_: undefined, __: object, { currentUser }: IApolloServerContext) => {
      if (!currentUser) throw new AuthenticationError();

      return UserRepository.findByEmail(currentUser.email);
    }
  }
};
