import { ApolloServer as Server } from "apollo-server-express";
import { apolloErrorConverter } from "./FormatErrors";
import { schema } from "./graphql/Schema";
import depthLimit from "graphql-depth-limit";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { JWT } from "./JWT";
import { Context } from "./graphqlContext";

export const ApolloServer = new Server({
  schema,
  validationRules: [depthLimit(1000)],
  formatError: apolloErrorConverter(),
  context: (expressContext: ExpressContext) => {
    const token = expressContext.req.headers.authorization || "";
    const apolloServerContext: Context = {
      ...(token && { currentUser: JWT.extractTokenPayload(token) })
    };
    return apolloServerContext;
  }
});
