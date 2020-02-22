import { GraphQLUser } from "./Types/GraphQLUser";
import { IApolloServerContext } from "../../App";
import { UserRepository } from "../../models/User/Repository";

export const userQueries = {
  me: {
    type: GraphQLUser,
    resolve: async (_: undefined, __: object, { currentUserEmail }: IApolloServerContext) => {
      if (!currentUserEmail) throw new Error("You are not authenticated!");

      return UserRepository.findByEmail(currentUserEmail);
    }
  }
};
