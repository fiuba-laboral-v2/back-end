import app from "./app";
import {Logger} from "./libs/logger";

const port = process.env.PORT || 5000;

app.listen(port, () => Logger.info(`Listening on port ${port}`));
