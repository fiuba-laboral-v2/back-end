import { rule, chain } from "graphql-shield";
import { AuthenticationError, UnauthorizedError } from "./Errors";
import { IApolloServerContext } from "src/server";

const isUser = rule({ cache: "contextual" })
  ((parent, args, context: IApolloServerContext) => {
    if (!context.currentUser) throw new AuthenticationError();
    return true;
  });

const userHasApplicant = rule({ cache: "contextual" })
  (async (parent, args, context: IApolloServerContext) => {
    if (!context.currentUser.applicantUuid) throw new UnauthorizedError();
    return true;
  });

const isApplicant = chain(isUser, userHasApplicant);

export { isUser, isApplicant };
