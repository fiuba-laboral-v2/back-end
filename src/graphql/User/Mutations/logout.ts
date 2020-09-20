import { Boolean } from "$graphql/fieldTypes";
import { Context } from "$graphql/Context";
import { AuthConfig } from "$config/AuthConfig";

export const logout = {
  type: Boolean,
  resolve: async (_: undefined, __: undefined, { res: expressResponse }: Context) => {
    expressResponse.cookie(AuthConfig.cookieName, "", AuthConfig.cookieOptions);
  }
};
