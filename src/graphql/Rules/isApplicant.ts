import { chain } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";
import { rule } from "./rule";

const userHasApplicant = rule(async (parent, args, context: IApolloServerContext) => {
  if (!context.currentUser.applicant) return new UnauthorizedError();
  return true;
});

export const isApplicant = chain(isUser, userHasApplicant);
