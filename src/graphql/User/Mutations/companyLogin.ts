import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { CompanyUserHashedCredentials } from "$models/User/Credentials";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";
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
    const credentials = user.credentials;
    if (!(credentials instanceof CompanyUserHashedCredentials)) throw new BadCredentialsError();
    const isValid = await user.credentials.authenticate(password);
    if (!isValid) throw new BadCredentialsError();

    const token = await JWT.createToken(user);
    expressResponse.cookie(CookieConfig.cookieName, token, CookieConfig.cookieOptions);
  }
};

interface ILogin {
  email: string;
  password: string;
}
