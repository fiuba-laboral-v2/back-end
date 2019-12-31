import express from "express";
import { json, urlencoded } from "body-parser";
import RootRoute from "./routes/root";
import { Logger } from "./config/logger";

const app: express.Express = express();
const port = process.env.PORT || 5000;

app.listen(port, () => Logger.info(`Listening on port ${port}`));
app.use(json());
app.use(urlencoded({extended: true}));

RootRoute.set(app);

module.exports = app;
