import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { AuthConfig } from "$config/AuthConfig";
import { BadCredentialsError } from "$graphql/User/Errors";

export const companyLogin = {
  type: Boolean,
  args: {
    email: {
      type: nonNull(String)
    },
    password: {
      type: nonNull(String)
    }
  },
  resolve: async (_: undefined, { email, password }: ILogin, { res: expressResponse }: Context) => {
    const user = await UserRepository.findByEmail(email);
    const isValid = await user.passwordMatches(password);
    if (!isValid) throw new BadCredentialsError();

    const token = await JWT.createToken(user);
    expressResponse.cookie(AuthConfig.cookieName, token, AuthConfig.cookieOptions);
  }
};

interface ILogin {
  email: string;
  password: string;
}
