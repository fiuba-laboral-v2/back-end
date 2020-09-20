import { chain } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";
import { rule } from "./rule";

const userIsAdmin = rule(async (parent, args, context: IApolloServerContext) => {
  if (!context.currentUser.getAdmin()) return new UnauthorizedError();
  return true;
});

export const isAdmin = chain(isUser, userIsAdmin);
