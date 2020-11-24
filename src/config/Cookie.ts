import { CookieOptions } from "express-serve-static-core";
import { Environment } from "./Environment";
import { TOKEN_EXPIRATION_MILLISECONDS } from "./JWT";

const localCookieConfig = {
  cookieName: "fiuba_laboral_v2_access_token",
  cookieOptions: {
    secure: false,
    httpOnly: true,
    maxAge: TOKEN_EXPIRATION_MILLISECONDS,
    sameSite: "strict" as SameSite
  }
};

export const CookieConfig: ICookieConfig = {
  production: {
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: true,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict" as SameSite
    }
  },
  staging: {
    cookieName: "fiuba_laboral_v2_access_token",
    cookieOptions: {
      secure: false,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION_MILLISECONDS,
      sameSite: "strict" as SameSite
    }
  },
  development: localCookieConfig,
  test: localCookieConfig
}[Environment.NODE_ENV()];

type SameSite = boolean | "lax" | "strict" | "none";

interface ICookieConfig {
  cookieOptions: CookieOptions;
  cookieName: string;
}
