import { User } from "./models/User";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { ICurrentUser } from "./graphqlContext";
import { AuthConfig } from "./config/AuthConfig";

let JWT_SECRET: string;
if (["test", "development", "test_travis"].includes(Environment.NODE_ENV)) {
  JWT_SECRET = "Environment.JWT_SECRET";
} else {
  if (!Environment.JWT_SECRET) throw new Error("JWT_SECRET not set");
  JWT_SECRET = Environment.JWT_SECRET;
}

export const JWT = {
  createToken: async (user: User) => {
    const applicant = await user.getApplicant();
    const companyUser = await user.getCompanyUser();
    const isApplicant = applicant?.uuid && !companyUser?.companyUuid;
    const isCompanyUser = !applicant?.uuid && companyUser?.companyUuid;
    const payload = {
      uuid: user.uuid,
      email: user.email,
      ...(isApplicant && { applicantUuid: applicant.uuid }),
      ...(isCompanyUser && { companyUuid: companyUser.companyUuid })
    };

    return sign(
      payload,
      JWT_SECRET,
      { expiresIn: AuthConfig.JWT.expiresIn }
    );
  },
  decodeToken: (token: string): ICurrentUser | undefined => {
    try {
      const payload = verify(token, JWT_SECRET) as ICurrentUser;
      const user = {
        uuid: payload.uuid,
        email: payload.email
      };
      const applicantUuid = !payload.companyUuid && payload.applicantUuid;
      const companyUuid = !payload.applicantUuid && payload.companyUuid;
      if (companyUuid) return { ...user, companyUuid };
      if (applicantUuid) return { ...user, applicantUuid };
      return user;
    } catch (e) {
      return;
    }
  },
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWT_SECRET,
        credentialsRequired: false
      })
    );
  },
  extractTokenPayload: (token: string): ICurrentUser | undefined => JWT.decodeToken(token)
};
