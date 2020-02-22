import express from "express";
import { ApolloServer as Server } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import cors from "cors";
import Schema from "./graphql/Schema";
import { Logger } from "./libs/Logger";
import { Environment } from "./config/Environment";
import { JWT } from "./JWT";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

Logger.info(`Running on ${Environment.NODE_ENV} environment`);

const App: express.Express = express();
App.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
    preflightContinue: true,
    exposedHeaders: [
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept",
      "X-Password-Expired"
    ],
    optionsSuccessStatus: 200
  })
);

interface IApolloServerContext {
  currentUserEmail?: string;
}

const ApolloServer = new Server({
  schema: Schema,
  validationRules: [depthLimit(1000)],
  context: (expressContext: ExpressContext) => {
    const apolloServerContext: IApolloServerContext = {
      currentUserEmail: JWT.extractTokenPayload(expressContext.req)?.email
    };
    return apolloServerContext;
  }
});

ApolloServer.applyMiddleware({ app: App, path: "/graphql" });
JWT.applyMiddleware({ app: App });

export { App, IApolloServerContext };
