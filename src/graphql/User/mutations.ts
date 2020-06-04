import { nonNull, String } from "../fieldTypes";
import { IUser } from "../../models/User";
import { UserRepository } from "../../models/User/Repository";
import { JWT } from "../../JWT";
import { Context } from "../../graphqlContext";
import { BadCredentialsError } from "./Errors";
import { AuthConfig } from "../../config/AuthConfig";

export const userMutations = {
  login: {
    type: String,
    args: {
      email: {
        type: nonNull(String)
      },
      password: {
        type: nonNull(String)
      }
    },
    resolve: async (
      _: undefined,
      { email, password }: IUser,
      { res: expressResponse }: Context
    ) => {
      const user = await UserRepository.findByEmail(email);
      const valid = await user.passwordMatches(password);
      if (!valid) throw new BadCredentialsError();

      const token = await JWT.createToken(user);
      expressResponse.cookie(AuthConfig.cookieName, token, AuthConfig.cookieOptions);
      return token;
    }
  }
};
