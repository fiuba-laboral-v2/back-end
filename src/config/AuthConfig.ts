import { CookieOptions } from "express-serve-static-core";
import { CorsOptions } from "cors";
import { Algorithm } from "jsonwebtoken";
import { Environment } from "./Environment";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

const LOCAL_FRONT_END_DOMAIN = "http://localhost:3000";
const STAGING_FRONT_END_DOMAIN = "http://antiguos.fi.uba.ar";
const PRODUCTION_FRONT_END_DOMAIN = "http://laboral.fi.uba.ar";

const corsOptions = (origin: string): CorsOptions => ({
  origin: origin,
  credentials: true,
  optionsSuccessStatus: 200
});

const localAuthConfig: IEnvironment = {
  cors: {
    options: corsOptions(LOCAL_FRONT_END_DOMAIN),
    accessControlAllowOrigin: LOCAL_FRONT_END_DOMAIN
  },
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

const AuthConfigForAllEnvironments: IAuthenticationVariables = {
  production: {
    cors: {
      options: corsOptions(PRODUCTION_FRONT_END_DOMAIN),
      accessControlAllowOrigin: PRODUCTION_FRONT_END_DOMAIN
    },
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
    cors: {
      options: corsOptions(STAGING_FRONT_END_DOMAIN),
      accessControlAllowOrigin: STAGING_FRONT_END_DOMAIN
    },
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
};

export const AuthConfig: IEnvironment = AuthConfigForAllEnvironments[Environment.NODE_ENV];

interface IJWT {
  expiresIn: string;
  algorithms: Algorithm[];
}

interface ICors {
  options: CorsOptions;
  accessControlAllowOrigin: string;
}

export interface IEnvironment {
  JWT: IJWT;
  cors: ICors;
  cookieOptions: CookieOptions;
  cookieName: string;
}

interface IAuthenticationVariables {
  production: IEnvironment;
  staging: IEnvironment;
  development: IEnvironment;
  test: IEnvironment;
}
