import { FrontendConfig, Environment } from "$config";
import { CorsOptions } from "cors";

const corsOptions = (origin: string): CorsOptions => ({
  origin: origin,
  credentials: true,
  optionsSuccessStatus: 200
});

export const CorsConfig: CorsOptions = {
  production: corsOptions(FrontendConfig.baseUrl),
  staging: corsOptions(FrontendConfig.baseUrl),
  development: corsOptions(FrontendConfig.baseUrl),
  test: corsOptions(FrontendConfig.baseUrl)
}[Environment.NODE_ENV()];
