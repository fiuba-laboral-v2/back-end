import { chain, rule } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";

const userIsAdmin = rule({ cache: "contextual" })
(async (parent, args, context: IApolloServerContext) => {
  if (!context.currentUser.admin) throw new UnauthorizedError();
  return true;
});

export const isAdmin = chain(isUser, userIsAdmin);
