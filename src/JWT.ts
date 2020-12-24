import { User } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CurrentUser, CurrentUserBuilder, ICurrentUserTokenData } from "./models/CurrentUser";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { JWTConfig, JWTTokenType } from "./config";
import { Logger } from "./libs/Logger";

export const JWT = {
  createToken: async (user: User, tokenType: JWTTokenType) => {
    const admin = await AdminRepository.findByUserUuidIfExists(user.uuid!);
    const applicant = await ApplicantRepository.findByUserUuidIfExists(user.uuid!);
    const companyUser = await CompanyUserRepository.findByUserUuidIfExists(user.uuid!);
    const payload = {
      uuid: user.uuid,
      email: user.email,
      ...(admin?.userUuid && { admin: { userUuid: admin.userUuid } }),
      ...(applicant?.uuid && { applicant: { uuid: applicant.uuid } }),
      ...(companyUser?.companyUuid && {
        company: { uuid: companyUser.companyUuid }
      })
    };
    return sign(payload, JWTConfig.secret, {
      expiresIn: JWTConfig.expirationTime(tokenType)
    });
  },
  decodeToken: (token: string): CurrentUser | undefined => {
    try {
      return CurrentUserBuilder.build(verify(token, JWTConfig.secret) as ICurrentUserTokenData);
    } catch (error) {
      Logger.error(error.message, error);
      return;
    }
  },
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWTConfig.secret,
        credentialsRequired: JWTConfig.credentialsRequired,
        algorithms: JWTConfig.algorithms
      })
    );
  }
};
