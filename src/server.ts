import { ApolloServer as Server } from "apollo-server-express";
import { apolloErrorConverter } from "./FormatErrors";
import { schema } from "./graphql/Schema";
import depthLimit from "graphql-depth-limit";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { JWT } from "./JWT";
import { AuthConfig } from "./config/AuthConfig";
import { Context } from "./graphql/Context/graphqlContext";

export const ApolloServer = new Server({
  schema,
  validationRules: [depthLimit(1000)],
  formatError: apolloErrorConverter(),
  context: (expressContext: ExpressContext) => {
    expressContext.res.header({
      "Access-Control-Allow-Origin": AuthConfig.cors.accessControlAllowOrigin,
    });
    const token = expressContext.req.cookies[AuthConfig.cookieName] || "";
    const apolloServerContext: Context = {
      ...(token && { currentUser: JWT.extractTokenPayload(token) }),
      ...expressContext,
    };
    return apolloServerContext;
  },
});
