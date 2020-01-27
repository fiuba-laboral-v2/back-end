import express from "express";
import { ApolloServer as Server } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import cors from "cors";
import Schema from "./graphql/Schema";
import { Logger } from "./libs/Logger";
import Environment from "./config/Environment";

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

const ApolloServer = new Server({
  schema: Schema,
  validationRules: [depthLimit(1000)]
});
ApolloServer.applyMiddleware({ app: App, path: "/graphql" });

export { App, ApolloServer };
