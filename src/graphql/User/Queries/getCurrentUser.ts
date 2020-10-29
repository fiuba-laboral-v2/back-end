import { GraphQLUser } from "../Types/GraphQLUser";
import { Context } from "$graphql/Context";
import { UserRepository } from "$models/User";
import { AuthConfig } from "$config/AuthConfig";

export const getCurrentUser = {
  type: GraphQLUser,
  resolve: async (_: undefined, __: object, { res: expressResponse, currentUser }: Context) => {
    try {
      return currentUser && (await UserRepository.findByUuid(currentUser.uuid));
    } catch (error) {
      expressResponse.cookie(AuthConfig.cookieName, "", AuthConfig.cookieOptions);
      throw error;
    }
  }
};
