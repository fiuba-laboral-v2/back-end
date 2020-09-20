import { chain } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { UnauthorizedError } from "../Errors";
import { isUser } from "./isUser";
import { rule } from "./rule";

const userHasCompany = rule(async (_, __, context: IApolloServerContext) => {
  if (!context.currentUser.getCompany()) return new UnauthorizedError();
  return true;
});

export const isCompanyUser = chain(isUser, userHasCompany);
