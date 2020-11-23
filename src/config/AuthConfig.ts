import { CookieOptions } from "express-serve-static-core";
import { Algorithm } from "jsonwebtoken";
import { Environment } from "./Environment";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

const localAuthConfig: IEnvironment = {
  JWT: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    algorithms: ["RS256"]
  },
  cookieName: "fiuba_laboral_v2_access_token",
  cookieOptions: {
    secure: false,
    httpOnly: true,
    maxAge: TOKEN_EXPIRATION_MILLISECONDS,
    sameSite: "strict"
  }
};

export const AuthConfig: IEnvironment = {
  production: {
    JWT: {
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
      algorithms: ["RS256"]
    },
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: true,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  staging: {
    JWT: {
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
      algorithms: ["RS256"]
    },
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  development: localAuthConfig,
  test: localAuthConfig
}[Environment.NODE_ENV];

interface IJWT {
  expiresIn: string;
  algorithms: Algorithm[];
}

interface IEnvironment {
  JWT: IJWT;
  cookieOptions: CookieOptions;
  cookieName: string;
}
