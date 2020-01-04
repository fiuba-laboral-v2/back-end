import express from "express";
import { json, urlencoded } from "body-parser";
import RootRoute from "./routes/root";
import Model from "./models";
import {Logger} from "./libs/logger";

Logger.info(`Running on ${process.env.NODE_ENV} environment`);
const app: express.Express = express();

app.use(json());
app.use(urlencoded({extended: true}));

Model.set();

RootRoute.set(app);

export default app;
