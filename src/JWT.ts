import { User } from "./models/User";
import { Environment } from "./config/Environment";
import { sign } from "jsonwebtoken";
import { Application, Request } from "express";
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
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWT_SECRET,
        credentialsRequired: false
      })
    );
  },
  extractTokenPayload: (request: Request): IPayload => (request as any).user
};
