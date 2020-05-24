import { rule, chain } from "graphql-shield";
import { AuthenticationError, UnauthorizedError } from "./Errors";
import { IApolloServerContext } from "../graphqlContext";

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

const userHasCompany = rule({ cache: "contextual" })
  (async (parent, args, context: IApolloServerContext) => {
    if (context.currentUser.companyUuid === undefined) throw new UnauthorizedError();
    return true;
  });

const isApplicant = chain(isUser, userHasApplicant);
const isCompanyUser = chain(isUser, userHasCompany);

export { isUser, isApplicant, isCompanyUser };
