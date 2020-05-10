import { rule } from "graphql-shield";
import { AuthenticationError, UnauthorizedError } from "./Errors";

const isAuthenticated = rule({ cache: "contextual" })
  ((parent, args, ctx, info) => {
    if (!ctx.currentUser) throw new AuthenticationError();
    return true;
  });

const isAuthorized = rule({ cache: "contextual" })
  (async (parent, args, ctx, info) => {

    if (!ctx.currentUser.applicantUuid) throw new UnauthorizedError();
    return true;
  });

export { isAuthenticated, isAuthorized };
