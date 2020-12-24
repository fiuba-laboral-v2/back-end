import { Algorithm } from "jsonwebtoken";
import { Environment } from "$config";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
export const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
export type JWTTokenType = "login" | "recoverPassword";
const expirationTimeInSeconds = (type: JWTTokenType) => {
  switch (type) {
    case "login":
      return TOKEN_EXPIRATION_DAYS_AS_STRING;
    case "recoverPassword":
      return "30m";
  }
};

export const JWTConfig: IJWTConfig = {
  production: {
    expirationTimeInSeconds,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  staging: {
    expirationTimeInSeconds,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  development: {
    expirationTimeInSeconds,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  test: {
    expirationTimeInSeconds,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  }
}[Environment.NODE_ENV()];

interface IJWTConfig {
  expirationTimeInSeconds: (tokenType: JWTTokenType) => string;
  credentialsRequired: boolean;
  algorithms: Algorithm[];
  secret: string;
}
