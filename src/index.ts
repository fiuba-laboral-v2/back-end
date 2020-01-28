import { App } from "./App";
import * as Database from "./config/Database";
import { Logger } from "./libs/Logger";

const port = process.env.PORT || 5006;

App.listen(port, () => Logger.info(`Listening on port ${port}`));
Database.default.setConnection();
