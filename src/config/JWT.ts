import { Algorithm } from "jsonwebtoken";
import { Environment } from "$config";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
export const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const JWTConfig: IJWTConfig = {
  production: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"] as Algorithm[],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  staging: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"] as Algorithm[],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  development: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"] as Algorithm[],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  test: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"] as Algorithm[],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  }
}[Environment.NODE_ENV()];

interface IJWTConfig {
  expiresIn: string;
  credentialsRequired: boolean;
  algorithms: Algorithm[];
  secret: string;
}
