import { ApolloServer as Server } from "apollo-server-express";
import { apolloErrorConverter } from "./FormatErrors";
import Schema from "./graphql/Schema";
import depthLimit from "graphql-depth-limit";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { JWT } from "./JWT";

export interface ICurrentUser {
  uuid: string;
  email: string;
  applicantUuid?: string;
}

export interface IApolloServerContext {
  currentUser?: ICurrentUser;
}

export const ApolloServer = new Server({
  schema: Schema,
  validationRules: [depthLimit(1000)],
  formatError: apolloErrorConverter(),
  context: (expressContext: ExpressContext) => {
    const token = expressContext.req.headers.authorization || "";
    const apolloServerContext: IApolloServerContext = {
      currentUser: JWT.extractTokenPayload(token)
    };
    return apolloServerContext;
  }
});
