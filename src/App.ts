import express from "express";
import { cors } from "./cors";
import cookieParser from "cookie-parser";
import { Logger } from "./libs/Logger";
import { Environment } from "./config/Environment";
import { ApolloServer } from "./server";
import { JWT } from "./JWT";

Logger.info(`Running on ${Environment.NODE_ENV()} environment`);

const App: express.Express = express();
App.use(cors());
App.use(cookieParser());
ApolloServer.applyMiddleware({ app: App, path: "/graphql" });
JWT.applyMiddleware({ app: App });

export { App };
