import { Algorithm } from "jsonwebtoken";
import { Environment } from "$config";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
export const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const JWTConfig: IJWTConfig = {
  production: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"]
  },
  staging: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"]
  },
  development: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"]
  },
  test: {
    expiresIn: TOKEN_EXPIRATION_DAYS_AS_STRING,
    credentialsRequired: false,
    algorithms: ["RS256"]
  }
}[Environment.NODE_ENV];

interface IJWTConfig {
  expiresIn: string;
  credentialsRequired: boolean;
  algorithms: Algorithm[];
}
