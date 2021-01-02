import { nonNull, String, Int } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";
import { PasswordRecoveryEmailSender } from "$services/EmailSender";
import { Context } from "$graphql/Context";
import { CookieConfig } from "$config";
import { UnauthorizedError } from "$graphql/Errors";

export const sendPasswordRecoveryEmail = {
  type: Int,
  args: {
    email: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { email }: ISendPasswordRecoveryEmail,
    { res: expressResponse, currentUser: context }: Context
  ) => {
    if (context) {
      expressResponse.cookie(CookieConfig.cookieName, "", CookieConfig.cookieOptions);
      throw new UnauthorizedError();
    }
    const user = await UserRepository.findCompanyUserByEmail(email);
    PasswordRecoveryEmailSender.send(user);
  }
};

export interface ISendPasswordRecoveryEmail {
  email: string;
}
