import { CookieOptions } from "express-serve-static-core";
import { Environment } from "./Environment";
import { TOKEN_EXPIRATION_MILLISECONDS } from "./JWT";

const localCookieConfig = {
  cookieName: "fiuba_laboral_v2_access_token",
  cookieOptions: {
    secure: false,
    httpOnly: true,
    maxAge: TOKEN_EXPIRATION_MILLISECONDS,
    sameSite: "strict"
  }
};

export const CookieConfig: ICookieConfig = {
  production: {
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: true,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  staging: {
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict"
    }
  },
  development: localCookieConfig,
  test: localCookieConfig
}[Environment.NODE_ENV];

interface ICookieConfig {
  cookieOptions: CookieOptions;
  cookieName: string;
}
