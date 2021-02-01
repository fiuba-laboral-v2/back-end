import { nonNull, String, Int } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { CompanyUserRepository } from "$models/CompanyUser";
import { JWT } from "$src/JWT";
import { UnauthorizedError } from "$graphql/Errors";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";

export const updateMyForgottenPassword = {
  type: Int,
  args: {
    token: {
      type: nonNull(String)
    },
    newPassword: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { token, newPassword }: IUpdateMyForgottenPassword,
    { res: expressResponse, currentUser: context }: Context
  ) => {
    if (context) {
      expressResponse.cookie(CookieConfig.cookieName, "", CookieConfig.cookieOptions);
      throw new UnauthorizedError();
    }
    const currentUser = JWT.decodeToken(token);
    if (!currentUser) throw new UnauthorizedError();
    const user = await UserRepository.findByUuid(currentUser.uuid);
    await CompanyUserRepository.findByUserUuid(currentUser.uuid);
    user.credentials = new CompanyUserRawCredentials({ password: newPassword });
    await UserRepository.save(user);
  }
};

export interface IUpdateMyForgottenPassword {
  token: string;
  newPassword: string;
}
