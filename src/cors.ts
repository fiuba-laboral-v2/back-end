import CORS from "cors";
import { AuthConfig } from "./config/AuthConfig";

export const cors = () => CORS(AuthConfig.cors.options);
