import { Boolean, nonNull, String } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { JWT } from "$src/JWT";
import { Context } from "$graphql/Context";
import { AuthConfig } from "$config/AuthConfig";
import { BadCredentialsError } from "$graphql/User/Errors";
import { FiubaUsersService } from "$services";

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
    const isValid = await FiubaUsersService.authenticate({ dni: user.dni, password });
    if (!isValid) throw new BadCredentialsError();

    const token = await JWT.createToken(user);
    expressResponse.cookie(AuthConfig.cookieName, token, AuthConfig.cookieOptions);
  }
};

interface ILogin {
  dni: string;
  password: string;
}
