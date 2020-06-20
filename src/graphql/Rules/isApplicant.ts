import { chain, rule } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";

const userHasApplicant = rule({ cache: "contextual" })
  (async (parent, args, context: IApolloServerContext) => {
    if (!context.currentUser.applicant) throw new UnauthorizedError();
    return true;
  });

export const isApplicant = chain(isUser, userHasApplicant);
