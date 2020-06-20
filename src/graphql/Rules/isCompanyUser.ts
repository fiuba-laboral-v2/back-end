import { chain, rule } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";

const userHasCompany = rule({ cache: "contextual" })
(async (parent, args, context: IApolloServerContext) => {
  if (!context.currentUser.company) throw new UnauthorizedError();
  return true;
});

export const isCompanyUser = chain(isUser, userHasCompany);
