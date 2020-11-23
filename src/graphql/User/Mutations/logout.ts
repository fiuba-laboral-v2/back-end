import { Boolean } from "$graphql/fieldTypes";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";

export const logout = {
  type: Boolean,
  resolve: async (_: undefined, __: undefined, { res: expressResponse }: Context) => {
    expressResponse.cookie(CookieConfig.cookieName, "", CookieConfig.cookieOptions);
  }
};
