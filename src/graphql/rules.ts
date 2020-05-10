import { rule } from "graphql-shield";
import { AuthenticationError } from "./Errors";

const isAuthenticated = rule({ cache: "contextual" })
  ((parent, args, ctx, info) => {
    if (!ctx.currentUser) throw new AuthenticationError();
    return true;
  });

export { isAuthenticated };
