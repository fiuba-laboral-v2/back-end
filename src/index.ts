import { App } from "$src/App";
import Database from "$config/Database";
import { Logger } from "$libs/Logger";

const port = process.env.PORT || 5006;

App.listen(port, () => Logger.info(`Listening on port ${port}`));
Database.setConnection();
