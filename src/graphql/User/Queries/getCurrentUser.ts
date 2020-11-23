import { GraphQLUser } from "../Types/GraphQLUser";
import { Context } from "$graphql/Context";
import { UserRepository } from "$models/User";
import { CookieConfig } from "$config";

export const getCurrentUser = {
  type: GraphQLUser,
  resolve: async (_: undefined, __: object, { res: expressResponse, currentUser }: Context) => {
    try {
      return currentUser && (await UserRepository.findByUuid(currentUser.uuid));
    } catch (error) {
      expressResponse.cookie(CookieConfig.cookieName, "", CookieConfig.cookieOptions);
      throw error;
    }
  }
};
