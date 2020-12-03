import { chain } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";
import { rule } from "./rule";

const userIsAdmin = rule(async (_, __, context: IApolloServerContext) => {
  if (!context.currentUser.getAdminRole()) return new UnauthorizedError();
  return true;
});

export const isAdmin = chain(isUser, userIsAdmin);
