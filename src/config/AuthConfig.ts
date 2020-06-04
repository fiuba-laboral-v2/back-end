import { CookieOptions } from "express-serve-static-core";
import { Environment } from "./Environment";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

const AuthConfigForAllEnvironments: IAuthenticationVariables = {
  production: {
    JWT: {
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING
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
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING
    },
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  development: {
    JWT: {
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING
    },
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  test: {
    JWT: {
      expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING
    },
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  }
};

export const AuthConfig: IEnvironment = AuthConfigForAllEnvironments[Environment.NODE_ENV];

interface IJWT {
  expiresIn: string;
}

export interface IEnvironment {
  JWT: IJWT;
  cookieOptions: CookieOptions;
  cookieName: string;
}

interface IAuthenticationVariables {
  production: IEnvironment;
  staging: IEnvironment;
  development: IEnvironment;
  test: IEnvironment;
}
