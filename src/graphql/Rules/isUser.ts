import { IApolloServerContext } from "../Context";
import { AuthenticationError } from "../Errors";
import { rule } from "./rule";

export const isUser = rule((_, __, context: IApolloServerContext) => {
  if (!context.currentUser) return new AuthenticationError();
  return true;
});
