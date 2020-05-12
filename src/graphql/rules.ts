import { rule } from "graphql-shield";
import { AuthenticationError, UnauthorizedError } from "./Errors";

const isAuthenticated = rule({ cache: "contextual" })
  ((parent, args, context) => {
    if (!context.currentUser) throw new AuthenticationError();
    return true;
  });

const isApplicant = rule({ cache: "contextual" })
  (async (parent, args, context) => {
    if (!context.currentUser.applicantUuid) throw new UnauthorizedError();
    return true;
  });

export { isAuthenticated, isApplicant };
