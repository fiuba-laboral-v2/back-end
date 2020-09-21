import { chain } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";
import { rule } from "./rule";

const userHasApplicant = rule(async (_, __, context: IApolloServerContext) => {
  if (!context.currentUser.getApplicant()) return new UnauthorizedError();
  return true;
});

export const isApplicant = chain(isUser, userHasApplicant);
