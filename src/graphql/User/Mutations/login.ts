import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { JWT } from "../../../JWT";
import { Context } from "$graphql/Context/graphqlContext";
import { AuthConfig } from "$config/AuthConfig";

export const login = {
  type: Boolean,
  args: {
    email: {
      type: nonNull(String),
    },
    password: {
      type: nonNull(String),
    },
  },
  resolve: async (_: undefined, { email, password }: ILogin, { res: expressResponse }: Context) => {
    const user = await UserRepository.findByEmail(email);
    await UserRepository.validateCredentials(user, password);

    const token = await JWT.createToken(user);
    expressResponse.cookie(AuthConfig.cookieName, token, AuthConfig.cookieOptions);
  },
};

interface ILogin {
  email: string;
  password: string;
}
