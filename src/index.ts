import { app } from "./app";
import Database from "./config/Database";
import { Logger } from "./libs/Logger";

const port = process.env.PORT || 5000;

app.listen(port, () => Logger.info(`Listening on port ${port}`));
Database.setConnection();
