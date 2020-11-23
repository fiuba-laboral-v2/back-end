import { ApolloServer as Server } from "apollo-server-express";
import { apolloErrorConverter } from "./FormatErrors";
import { schema } from "./graphql/Schema";
import depthLimit from "graphql-depth-limit";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { JWT } from "./JWT";
import { AuthConfig, FrontendConfig } from "./config";
import { Context } from "./graphql/Context/graphqlContext";

export const ApolloServer = new Server({
  schema,
  validationRules: [depthLimit(1000)],
  formatError: apolloErrorConverter(),
  context: (expressContext: ExpressContext) => {
    expressContext.res.header({ "Access-Control-Allow-Origin": FrontendConfig.baseUrl });
    const token = expressContext.req.cookies[AuthConfig.cookieName] || "";
    const currentUser = token && JWT.extractTokenPayload(token);
    const apolloServerContext: Context = {
      ...(currentUser && { currentUser: currentUser }),
      ...expressContext
    };
    return apolloServerContext;
  }
});
