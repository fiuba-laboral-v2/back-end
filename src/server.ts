import { ApolloServer as Server } from "apollo-server-express";
import Schema from "./graphql/Schema";
import depthLimit from "graphql-depth-limit";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { JWT } from "./JWT";


export interface IApolloServerContext {
  currentUserEmail?: string;
}

export const ApolloServer = new Server({
  schema: Schema,
  validationRules: [depthLimit(1000)],
  context: (expressContext: ExpressContext) => {
    const apolloServerContext: IApolloServerContext = {
      currentUserEmail: JWT.extractTokenPayload(expressContext.req)?.email
    };
    return apolloServerContext;
  }
});
