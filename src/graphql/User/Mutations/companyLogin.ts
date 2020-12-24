import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";

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
    const user = await UserRepository.findCompanyUserByEmail(email);
    await user.credentials.authenticate(password);
    const token = await JWT.createToken(user, "login");
    expressResponse.cookie(CookieConfig.cookieName, token, CookieConfig.cookieOptions);
  }
};

interface ILogin {
  email: string;
  password: string;
}
