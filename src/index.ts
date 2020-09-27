import { App } from "./App";
import { Database, Environment } from "$config";
import { Logger } from "$libs/Logger";

Environment.validate();

const port = process.env.PORT || 5006;
App.listen(port, () => Logger.info(`Listening on port ${port}`));

Database.setConnection();
