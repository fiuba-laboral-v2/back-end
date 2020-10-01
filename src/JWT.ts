import { User } from "./models";
import { CurrentUser, CurrentUserBuilder, ICurrentUserTokenData } from "./models/CurrentUser";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { AuthConfig } from "./config/AuthConfig";

let JWT_SECRET: string;
if (["test", "development", "test_travis"].includes(Environment.NODE_ENV)) {
  JWT_SECRET = "Environment.JWT_SECRET";
} else {
  const secret = Environment.JWTSecret();
  if (!secret) throw new Error("JWT_SECRET not set");
  JWT_SECRET = secret;
}

export const JWT = {
  createToken: async (user: User) => {
    const admin = await user.getAdmin();
    const applicant = await user.getApplicant();
    const companyUser = await user.getCompanyUser();
    const payload = {
      uuid: user.uuid,
      email: user.email,
      ...(admin?.userUuid && { admin: { userUuid: admin.userUuid } }),
      ...(applicant?.uuid && { applicant: { uuid: applicant.uuid } }),
      ...(companyUser?.companyUuid && {
        company: { uuid: companyUser.companyUuid }
      })
    };

    return sign(payload, JWT_SECRET, { expiresIn: AuthConfig.JWT.expiresIn });
  },
  decodeToken: (token: string): CurrentUser | undefined => {
    try {
      return CurrentUserBuilder.build(verify(token, JWT_SECRET) as ICurrentUserTokenData);
    } catch (e) {
      return;
    }
  },
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWT_SECRET,
        credentialsRequired: false,
        algorithms: AuthConfig.JWT.algorithms
      })
    );
  },
  extractTokenPayload: (token: string): CurrentUser | undefined => JWT.decodeToken(token)
};
