import { Algorithm } from "jsonwebtoken";
import { Environment } from "$config";

const TOKEN_EXPIRATION_DAYS = 2;
const TOKEN_EXPIRATION_DAYS_AS_STRING = `${TOKEN_EXPIRATION_DAYS}d`;
export const TOKEN_EXPIRATION_MILLISECONDS = TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
export type JWTTokenType = "login" | "recoverPassword";
const expirationTime = (type: JWTTokenType) => {
  switch (type) {
    case "login":
      return TOKEN_EXPIRATION_DAYS_AS_STRING;
    case "recoverPassword":
      return "30m";
  }
};

export const JWTConfig: IJWTConfig = {
  production: {
    expirationTime,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  staging: {
    expirationTime,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  development: {
    expirationTime,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  },
  test: {
    expirationTime,
    credentialsRequired: false,
    algorithms: ["RS256"],
    secret: Environment.JWTSecret() || "Environment.JWT_SECRET"
  }
}[Environment.NODE_ENV()];

interface IJWTConfig {
  expirationTime: (tokenType: JWTTokenType) => string;
  credentialsRequired: boolean;
  algorithms: Algorithm[];
  secret: string;
}
