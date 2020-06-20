import { Boolean } from "../../fieldTypes";
import { Context } from "../../Context/graphqlContext";
import { AuthConfig } from "../../../config/AuthConfig";

export const logout = {
  type: Boolean,
  resolve: async (_: undefined, __: undefined, { res: expressResponse }: Context) => {
    expressResponse.cookie(AuthConfig.cookieName, "", AuthConfig.cookieOptions);
  }
};
