import { rule } from "graphql-shield";
import { IApolloServerContext } from "../Context";
import { AuthenticationError } from "../Errors";

export const isUser = rule({ cache: "contextual" })
  ((parent, args, context: IApolloServerContext) => {
    if (!context.currentUser) throw new AuthenticationError();
    return true;
  });
