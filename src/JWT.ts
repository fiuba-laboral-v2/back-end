import { User } from "./models/User";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";

export interface IPayload {
  uuid: string;
  email: string;
}

let JWT_SECRET: string;
if (["test", "development", "test_travis"].includes(Environment.NODE_ENV)) {
  JWT_SECRET = "Environment.JWT_SECRET";
} else {
  if (!Environment.JWT_SECRET) throw new Error("JWT_SECRET not set");
  JWT_SECRET = Environment.JWT_SECRET;
}

export const JWT = {
  createToken: (user: User) => {
    const payload: IPayload = {
      uuid: user.uuid,
      email: user.email
    };

    return sign(
      payload,
      JWT_SECRET,
      { expiresIn: "2d" }
    );
  },
  decodeToken: (token: string): IPayload | undefined => {
    try {
      const payload = verify(token, JWT_SECRET) as any;
      return {
        uuid: payload.uuid,
        email: payload.email
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
  extractTokenPayload: (token: string): IPayload | undefined => JWT.decodeToken(token)
};
