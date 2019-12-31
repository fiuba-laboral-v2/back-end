import express from "express";
import { json, urlencoded } from "body-parser";
import RootRoute from "./routes/root";

const app: express.Express = express();

app.use(json());
app.use(urlencoded({extended: true}));

RootRoute.set(app);

export default app;
