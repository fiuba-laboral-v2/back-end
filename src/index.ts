import app from "./app";
import { Logger } from "./libs/logger";
import Database from "./config/database";

const port = process.env.PORT || 5006;

app.listen(port, () => Logger.info(`Listening on port ${port}`));
Database.setConnection();
