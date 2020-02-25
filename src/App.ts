import express from "express";
import { cors } from "./cors";
import { Logger } from "./libs/Logger";
import { Environment } from "./config/Environment";
import { ApolloServer } from "./server";
import { JWT } from "./JWT";

Logger.info(`Running on ${Environment.NODE_ENV} environment`);

const App: express.Express = express();
App.use(cors());
ApolloServer.applyMiddleware({ app: App, path: "/graphql" });
JWT.applyMiddleware({ app: App });

export { App };
