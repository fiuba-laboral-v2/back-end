import express from "express";
import { Logger } from "./libs/logger";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import cors from "cors";
import { schema } from "./graphql";

Logger.info(`Running on ${process.env.NODE_ENV} environment`);

const app: express.Express = express();

const apolloServer = new ApolloServer({
  schema,
  validationRules: [depthLimit(1000)]
});

app.use(
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

apolloServer.applyMiddleware({ app, path: "/graphql" });

export { app, apolloServer };
