import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { CompanyUserRawCredentials, UserRepository } from "$models/User";
import { CompanyUserRepository } from "$models/CompanyUser";
import { JWT } from "$src/JWT";
import { UnauthorizedError } from "$graphql/Errors";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";

export const updateMyForgottenPassword = {
  type: GraphQLCompanyUser,
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
    const companyUser = await CompanyUserRepository.findByUserUuid(currentUser.uuid);
    user.credentials = new CompanyUserRawCredentials({ password: newPassword });
    await UserRepository.save(user);
    return companyUser;
  }
};

export interface IUpdateMyForgottenPassword {
  token: string;
  newPassword: string;
}
