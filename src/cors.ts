import CORS from "cors";
import { CorsConfig } from "./config";

export const cors = () => CORS(CorsConfig);
