import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { BadCredentialsError, UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";

export const fiubaLogin = {
  type: Boolean,
  args: {
    dni: {
      type: nonNull(String)
    },
    password: {
      type: nonNull(String)
    }
  },
  resolve: async (_: undefined, { dni, password }: ILogin, { res: expressResponse }: Context) => {
    const user = await UserRepository.findByDni(dni);
    await user.credentials.authenticate(password);

    const admin = await AdminRepository.findByUserUuidIfExists(user.uuid!);
    const applicant = await ApplicantRepository.findByUserUuidIfExists(user.uuid!);
    if (!admin && !applicant) throw new BadCredentialsError();

    const token = await JWT.createToken(user, "login");
    expressResponse.cookie(CookieConfig.cookieName, token, CookieConfig.cookieOptions);
  }
};

interface ILogin {
  dni: string;
  password: string;
}
