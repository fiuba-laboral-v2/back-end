import { User } from "./models/User";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { ICurrentUser } from "./graphqlContext";

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
    const payload: ICurrentUser = {
      uuid: user.uuid,
      email: user.email,
      ...(applicant && { applicantUuid: applicant.uuid })
    };

    return sign(
      payload,
      JWT_SECRET,
      { expiresIn: "2d" }
    );
  },
  decodeToken: (token: string): ICurrentUser | undefined => {
    try {
      const payload = verify(token, JWT_SECRET) as ICurrentUser;
      return {
        uuid: payload.uuid,
        email: payload.email,
        ...(payload.applicantUuid && { applicantUuid: payload.applicantUuid })
      };
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
